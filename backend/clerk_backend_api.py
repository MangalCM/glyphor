import os
import requests
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from dotenv import load_dotenv

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")  =

auth_scheme = HTTPBearer()

async def verify_clerk_token(request: Request):
    credentials = await auth_scheme(request)
    token = credentials.credentials


    #for testint da
    if token.startswith("eyJhbGciOiJIUzI1Ni"):
        import jwt
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload

    response = requests.post(
        "https://api.clerk.dev/v1/tokens/verify",
        headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
        json={"token": token}
    )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired Clerk token")

    return response.json()["jwt"]
