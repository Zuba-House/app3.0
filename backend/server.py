"""
Zuba Mobile Web - Backend API Proxy
This minimal backend proxies requests to the live Zuba API
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="Zuba Mobile Web API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Live Zuba API URL
ZUBA_API_URL = os.getenv("ZUBA_API_URL", "https://zuba-api.onrender.com")

@app.get("/")
async def root():
    return {"message": "Zuba Mobile Web API Proxy", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "zuba-mobile-web-proxy"}

# Proxy all /api/* requests to the live Zuba API
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_to_zuba(path: str, request: Request):
    """Proxy requests to the live Zuba API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Build the target URL
        target_url = f"{ZUBA_API_URL}/api/{path}"
        
        # Get request body if present
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.json()
            except:
                body = await request.body()
        
        # Forward headers (excluding host)
        headers = dict(request.headers)
        headers.pop("host", None)
        headers.pop("content-length", None)
        
        try:
            # Make the proxied request
            response = await client.request(
                method=request.method,
                url=target_url,
                params=dict(request.query_params),
                headers=headers,
                json=body if isinstance(body, dict) else None,
                content=body if isinstance(body, bytes) else None
            )
            
            return response.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Gateway timeout")
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Bad gateway: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
