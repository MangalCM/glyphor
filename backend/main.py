from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from clerk_backend_api import Clerk, ClerkError, SDKError
from forecast_router import router as forecast_router
from auth_router import router as auth_router



app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(forecast_router, prefix="/api")
app.include_router(auth_router, prefix="/auth")


@app.get("/")
async def welcome():
    return JSONResponse({"message": "Welcome to the Glyphor backend!"}, status_code=200)

@app.get("/health")
async def health_check():
    return JSONResponse({"status": "healthy"}, status_code=200)

@app.on_event("startup")
async def startup_event():
    print("App is starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    print("App is shutting down...")
