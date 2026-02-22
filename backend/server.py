"""
Zuba House Mobile App - Backend Proxy
Simple FastAPI server to serve the mobile web build
"""

import os
import json
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import httpx

app = FastAPI(title="Zuba House Mobile API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Zuba API Base URL
ZUBA_API_URL = os.getenv('ZUBA_API_URL', 'https://zuba-api.onrender.com')

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "app": "Zuba House Mobile"}

# Proxy API requests to Zuba backend
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_api(path: str, request: Request):
    """Proxy API requests to the Zuba backend"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        url = f"{ZUBA_API_URL}/api/{path}"
        
        # Get request body
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body = await request.json()
            except:
                body = await request.body()
        
        # Forward headers
        headers = {}
        if "authorization" in request.headers:
            headers["Authorization"] = request.headers["authorization"]
        if "content-type" in request.headers:
            headers["Content-Type"] = request.headers["content-type"]
        
        try:
            response = await client.request(
                method=request.method,
                url=url,
                json=body if isinstance(body, dict) else None,
                content=body if isinstance(body, bytes) else None,
                headers=headers,
                params=dict(request.query_params)
            )
            
            # Try to return JSON response
            try:
                return JSONResponse(
                    content=response.json(),
                    status_code=response.status_code
                )
            except:
                return JSONResponse(
                    content={"message": response.text},
                    status_code=response.status_code
                )
        except httpx.RequestError as e:
            return JSONResponse(
                content={"error": True, "message": str(e)},
                status_code=500
            )

# Mount static files from mobile dist
mobile_dist = Path("/app/mobile/dist")
if mobile_dist.exists():
    app.mount("/", StaticFiles(directory=str(mobile_dist), html=True), name="mobile")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
