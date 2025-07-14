from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from clerk_backend_api import Clerk
from clerk_backend_api.models import ClerkErrors, SDKError
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import os
import logging
import json
import jwt
from time import time
from forecast_router import router as forecast_router

CLERK_SECRET_KEY = "sk_test_ThQmkWYXaWXEg7jqr56JvKvzUhqM9Itpd16aV0mXbQ"
if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY environment variable is required")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
RATE_LIMIT_MAX_ATTEMPTS = int(os.getenv("RATE_LIMIT_MAX_ATTEMPTS", "5"))
RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "300"))

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('auth.log'),
        logging.StreamHandler()
    ]
)

clerk_client = Clerk(bearer_auth=CLERK_SECRET_KEY)

class AuthLogger:
    def __init__(self):
        self.logger = logging.getLogger('clerk_auth')
    
    def log_auth_event(self, event_type: str, user_id: str = None, 
                      session_id: str = None, client_ip: str = None, 
                      endpoint: str = None, success: bool = True, 
                      error_message: str = None, **kwargs):
        
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'success': success,
            'client_ip': client_ip,
            'endpoint': endpoint,
            'user_id': user_id,
            'session_id': session_id,
            'error_message': error_message,
            **kwargs
        }
        
        if success:
            self.logger.info(json.dumps(log_data))
        else:
            self.logger.error(json.dumps(log_data))
    
    def log_performance(self, endpoint: str, duration_ms: float, user_id: str = None):
        perf_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': 'performance',
            'endpoint': endpoint,
            'duration_ms': duration_ms,
            'user_id': user_id
        }
        self.logger.info(json.dumps(perf_data))

class AuthMetrics:
    def __init__(self):
        self.metrics = {
            'total_requests': 0,
            'successful_auths': 0,
            'failed_auths': 0,
            'rate_limited': 0,
            'token_refreshes': 0
        }
    
    def increment(self, metric: str):
        self.metrics[metric] = self.metrics.get(metric, 0) + 1
    
    def get_metrics(self) -> Dict[str, Any]:
        return self.metrics.copy()

class TokenManager:
    def __init__(self, clerk_client):
        self.clerk_client = clerk_client
        self.token_cache = {}
    
    async def refresh_session_if_needed(self, session_id: str, current_token: str) -> Optional[str]:
        try:
            decoded = jwt.decode(current_token, options={"verify_signature": False})
            exp_timestamp = decoded.get('exp')
            
            if exp_timestamp:
                exp_time = datetime.fromtimestamp(exp_timestamp)
                if exp_time - datetime.now() < timedelta(minutes=5):
                    return await self.refresh_session(session_id)
            
            return current_token
            
        except Exception as e:
            auth_logger.log_auth_event(
                event_type="token_inspection_failed",
                session_id=session_id,
                success=False,
                error_message=str(e)
            )
            return current_token
    
    async def refresh_session(self, session_id: str) -> Optional[str]:
        try:
            refreshed_session = self.clerk_client.sessions.refresh_session(session_id=session_id)
            auth_metrics.increment('token_refreshes')
            return refreshed_session.token
        except Exception as e:
            auth_logger.log_auth_event(
                event_type="session_refresh_failed",
                session_id=session_id,
                success=False,
                error_message=str(e)
            )
            return None

class RateLimiter:
    def __init__(self, max_attempts: int = RATE_LIMIT_MAX_ATTEMPTS, window_seconds: int = RATE_LIMIT_WINDOW_SECONDS):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.attempts = defaultdict(list)
        self.blocked_ips = defaultdict(float)
    
    def is_rate_limited(self, client_ip: str) -> bool:
        current_time = time()
        
        if client_ip in self.blocked_ips:
            if current_time < self.blocked_ips[client_ip]:
                return True
            else:
                del self.blocked_ips[client_ip]
        
        self.attempts[client_ip] = [
            attempt_time for attempt_time in self.attempts[client_ip]
            if current_time - attempt_time < self.window_seconds
        ]
        
        if len(self.attempts[client_ip]) >= self.max_attempts:
            self.blocked_ips[client_ip] = current_time + 900
            return True
        
        return False
    
    def record_attempt(self, client_ip: str, success: bool = False):
        if not success:
            self.attempts[client_ip].append(time())

class ClerkAuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, protected_paths: list = None):
        super().__init__(app)
        self.protected_paths = protected_paths or ["/protected", "/user-data"]
    
    async def dispatch(self, request: Request, call_next):
        start_time = time()
        auth_metrics.increment('total_requests')
        
        # Handle OPTIONS requests FIRST - before any authentication logic
        if request.method == "OPTIONS":
            response = await call_next(request)
            duration_ms = (time() - start_time) * 1000
            auth_logger.log_performance(request.url.path, duration_ms)
            return response
        
        # Check if path needs protection
        if not any(request.url.path.startswith(path) for path in self.protected_paths):
            response = await call_next(request)
            duration_ms = (time() - start_time) * 1000
            auth_logger.log_performance(request.url.path, duration_ms)
            return response
        
        # Get client IP for rate limiting
        client_ip = request.client.host
        
        # Rate limiting check
        if rate_limiter.is_rate_limited(client_ip):
            auth_metrics.increment('rate_limited')
            auth_logger.log_auth_event(
                event_type="rate_limit_exceeded",
                client_ip=client_ip,
                endpoint=request.url.path,
                success=False
            )
            return Response(
                content='{"detail": "Rate limit exceeded. Try again later."}',
                status_code=429,
                media_type="application/json"
            )
        
        # Authentication logic for protected paths
        try:
            auth_header = request.headers.get("Authorization")
            session_id = request.query_params.get("session_id")
            
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing authorization header")
            
            if not session_id:
                raise HTTPException(status_code=401, detail="Missing session_id")
            
            session_token = auth_header.split(" ")[1]
            
            # Refresh token if needed
            refreshed_token = await token_manager.refresh_session_if_needed(session_id, session_token)
            
            # Verify session with Clerk
            session = clerk_client.sessions.verify_session(
                session_id=session_id,
                request_body={"token": refreshed_token or session_token}
            )
            
            # Get user information
            user = clerk_client.users.get_user(user_id=session.user_id)
            
            # Store user data in request state
            request.state.user = {
                "user_id": session.user_id,
                "session_id": session_id,
                "user": user
            }
            
            # Record successful authentication
            rate_limiter.record_attempt(client_ip, success=True)
            auth_metrics.increment('successful_auths')
            
            auth_logger.log_auth_event(
                event_type="authentication_success",
                user_id=session.user_id,
                session_id=session_id,
                client_ip=client_ip,
                endpoint=request.url.path,
                success=True
            )
            
            # Process the request
            response = await call_next(request)
            
            # Add refreshed token to response headers if available
            if refreshed_token and refreshed_token != session_token:
                response.headers["X-New-Token"] = refreshed_token
            
            # Log performance metrics
            duration_ms = (time() - start_time) * 1000
            auth_logger.log_performance(request.url.path, duration_ms, session.user_id)
            
            return response
            
        except ClerkErrors as e:
            rate_limiter.record_attempt(client_ip, success=False)
            auth_metrics.increment('failed_auths')
            
            auth_logger.log_auth_event(
                event_type="authentication_failed",
                client_ip=client_ip,
                endpoint=request.url.path,
                success=False,
                error_message=str(e)
            )
            
            return Response(
                content=f'{{"detail": "Authentication failed: {str(e)}"}}',
                status_code=401,
                media_type="application/json"
            )
            
        except Exception as e:
            rate_limiter.record_attempt(client_ip, success=False)
            auth_metrics.increment('failed_auths')
            
            auth_logger.log_auth_event(
                event_type="authentication_error",
                client_ip=client_ip,
                endpoint=request.url.path,
                success=False,
                error_message=str(e)
            )
            
            return Response(
                content='{"detail": "Authentication error"}',
                status_code=500,
                media_type="application/json"
            )

auth_logger = AuthLogger()
auth_metrics = AuthMetrics()
token_manager = TokenManager(clerk_client)
rate_limiter = RateLimiter()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"],
)

app.add_middleware(ClerkAuthMiddleware)

app.include_router(forecast_router, prefix="/forecast", tags=["Forecast"])

@app.on_event("startup")
async def startup_event():
    auth_logger.log_auth_event(
        event_type="application_startup",
        success=True
    )
    print("Glyphor backend is starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    auth_logger.log_auth_event(
        event_type="application_shutdown",
        success=True
    )
    print("Glyphor backend is shutting down...")

@app.get("/")
async def welcome():
    return JSONResponse({"message": "Welcome to the Glyphor backend!"}, status_code=200)

@app.get("/health")
async def health_check():
    return JSONResponse({"status": "healthy"}, status_code=200)

@app.get("/metrics")
async def get_metrics():
    return JSONResponse(auth_metrics.get_metrics(), status_code=200)

@app.get("/protected")
async def protected_route(request: Request):
    user_data = request.state.user
    
    auth_logger.log_auth_event(
        event_type="protected_access",
        user_id=user_data['user_id'],
        session_id=user_data['session_id'],
        client_ip=request.client.host,
        endpoint="/protected",
        success=True
    )
    
    return JSONResponse({
        "message": f"Hello {user_data['user'].first_name}!",
        "user_id": user_data['user_id'],
        "session_id": user_data['session_id'],
        "user_data": {
            "email": user_data['user'].email_addresses[0].email_address,
            "name": f"{user_data['user'].first_name} {user_data['user'].last_name}"
        }
    }, status_code=200)

@app.post("/user-data")
async def create_user_data(request: Request, data: dict):
    user_data = request.state.user
    
    auth_logger.log_auth_event(
        event_type="data_creation",
        user_id=user_data['user_id'],
        session_id=user_data['session_id'],
        client_ip=request.client.host,
        endpoint="/user-data",
        success=True
    )
    
    return JSONResponse({
        "message": "Data created successfully",
        "user_id": user_data['user_id'],
        "data": data
    }, status_code=201)
