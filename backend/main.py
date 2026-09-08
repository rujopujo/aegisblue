import os
import sys
from datetime import datetime, timezone
from typing import List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import (
    BoundaryCheckRequest,
    BoundaryCheckResult,
    SatelliteAuditRequest,
    SatelliteAuditResponse,
    TokenizedProject,
    RetirementRequest,
    RetirementRecord
)
from services.spatial import validate_boundary
from services.satellite_mrv import perform_satellite_audit
from services.database import (
    init_db,
    get_all_projects,
    get_project_by_id,
    save_or_update_project,
    get_all_retirements,
    save_retirement
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables on startup
    init_db()
    yield

app = FastAPI(
    title="AegisBlue Geospatial & Satellite MRV Microservice",
    description="Decentralized Blue Carbon Digital MRV, Spatial Anti-Fraud Gatekeeper, and On-Chain Registry API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for all frontend clients (Vite dev server, Docker container, local network)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "AegisBlue Satellite MRV & Spatial Engine",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "capabilities": [
            "Sentinel-2 Multispectral Telemetry",
            "IPCC Tier-3 Wetland Supplement Allometric Biomass Math",
            "GMW v3.0 Spatial Gatekeeper & Anti-Fraud Polygon Verification",
            "SQLite Ledger Persistence for Projects & Credit Retirements"
        ]
    }

@app.post("/api/spatial/validate", response_model=BoundaryCheckResult)
def validate_project_boundary(request: BoundaryCheckRequest):
    """
    Validates drawn project boundary against official Global Mangrove Watch polygons.
    Rejects inland, urban, and non-mangrove fraud attempts.
    """
    if not request.coordinates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coordinates list cannot be empty."
        )
    return validate_boundary(request.coordinates)

@app.post("/api/satellite/audit", response_model=SatelliteAuditResponse)
def run_satellite_audit(request: SatelliteAuditRequest):
    """
    Simulates Sentinel-2 multispectral band retrieval (NIR, Red, Green, SWIR)
    and computes NDVI, EVI, biomass carbon, and total CO2 tons according to IPCC guidelines.
    """
    if len(request.coordinates) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid GPS coordinates [lat, lng] required."
        )
    return perform_satellite_audit(
        coordinates=request.coordinates,
        area_ha=request.areaHa,
        canopy_density_multiplier=request.canopyDensityMultiplier,
        bbox=request.boundingBox
    )

@app.get("/api/projects", response_model=List[Dict[str, Any]])
def list_projects():
    """
    Returns all registered, tokenized blue carbon projects stored in SQLite database.
    """
    return get_all_projects()

@app.post("/api/projects")
def create_project(project: TokenizedProject):
    """
    Saves a newly registered and tokenized mangrove project into SQLite persistence.
    """
    project_dict = project.model_dump()
    save_or_update_project(project_dict)
    return {
        "status": "SUCCESS",
        "message": f"Project '{project.name}' successfully recorded.",
        "projectId": project.id
    }

@app.get("/api/retirements", response_model=List[Dict[str, Any]])
def list_retirements():
    """
    Returns all recorded corporate carbon credit retirement transactions.
    """
    return get_all_retirements()

@app.post("/api/retirements")
def retire_carbon_credits(request: RetirementRequest):
    """
    Executes and records a corporate carbon credit retirement (burn).
    Decrements project available tokens, creates certificate hash, and saves to SQLite.
    """
    project = get_project_by_id(request.projectId)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with ID '{request.projectId}' not found."
        )

    tokenization = project.get("tokenization", {})
    available = tokenization.get("availableCredits", 0.0)
    retired = tokenization.get("retiredCredits", 0.0)

    if request.tonsToRetire > available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested retirement ({request.tonsToRetire} tons) exceeds available pool ({available} tons)."
        )

    # Update project credits
    tokenization["availableCredits"] = available - request.tonsToRetire
    tokenization["retiredCredits"] = retired + request.tonsToRetire
    project["tokenization"] = tokenization
    save_or_update_project(project)

    # Generate burn record
    now_ts = int(datetime.now(timezone.utc).timestamp())
    now_iso = datetime.now(timezone.utc).isoformat()
    record_id = f"RET-{str(now_ts)[-6:]}"
    certificate_id = f"ESG-NETZERO-{os.urandom(3).hex().upper()}-2026"
    tx_hash = f"0x{os.urandom(16).hex()}98f2c3a71b402e8d91c53b2a"
    burn_block = tokenization.get("blockNumber", 14892000) + 124

    record = {
        "id": record_id,
        "projectId": project["id"],
        "projectName": project["name"],
        "companyName": request.companyName,
        "companyWallet": request.companyWallet,
        "tonsRetired": request.tonsToRetire,
        "purpose": request.purpose,
        "vintageYear": 2026,
        "txHash": tx_hash,
        "burnReceiptBlock": burn_block,
        "retiredAt": now_iso,
        "certificateId": certificate_id,
        "ipfsCertificateCid": f"bafybeig{os.urandom(4).hex()}burncert77x1"
    }

    save_retirement(record)

    return {
        "status": "RETIRED",
        "updatedProject": project,
        "retirementRecord": record
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
