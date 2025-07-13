from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from clerk_backend_api import Clerk
from clerk_backend_api import ClerkError, SDKError


app = FastAPI()

#cors config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

@app.on_event("startup")
async def startup_Event():
    print("app is starting up...")
    pass

@app.on_event("shutdown")
async def shutdown_event():
    print("app is shuttung down...")
    pass

#so need to add up like singup and signin from clerk backend api
@app.get("/")
async def welcome():
    return JSONResponse({"message": "Welcome to the Glyphor backend!"}, status_code=200)

@app.get("/health")
async def health_check():
    return JSONResponse({"status":"healthy"}, status_code=200)

