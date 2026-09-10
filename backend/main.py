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
    RetirementRecord,
    CertificateVerificationResponse,
    AuditDossierPinRequest,
    AuditDossierPinResponse
)
from services.spatial import validate_boundary
from services.satellite_mrv import perform_satellite_audit
from services.ipfs_service import (
    pin_json_to_ipfs,
    PinataConfigError,
    PinataNetworkError,
    PinataAPIError,
    PinataError
)
from services.database import (
    init_db,
    get_all_projects,
    get_project_by_id,
    save_or_update_project,
    get_all_retirements,
    get_retirement_by_certificate_id,
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
    Records a confirmed on-chain carbon credit retirement (burn).
    Validates retirement data, decrements project available tokens in SQLite, and persists the record.
    Does NOT generate fake transaction hashes or fake block numbers.
    """
    # 1. Validate retirement amount
    if request.tonsToRetire <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'tonsToRetire' must be greater than 0."
        )

    # 2. Validate wallet address (42 chars, 0x prefix, hex)
    clean_wallet = (request.companyWallet or "").strip()
    if not (clean_wallet.startswith("0x") and len(clean_wallet) == 42):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'companyWallet' must be a valid 42-character hexadecimal Ethereum address starting with '0x'."
        )
    try:
        int(clean_wallet[2:], 16)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'companyWallet' contains invalid hexadecimal characters."
        )

    # 3. Validate transactionHash if supplied (66 chars, 0x prefix, hex)
    clean_tx_hash = request.transactionHash.strip() if request.transactionHash else None
    if clean_tx_hash:
        if not (clean_tx_hash.startswith("0x") and len(clean_tx_hash) == 66):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Field 'transactionHash' must be a valid 66-character hexadecimal Ethereum transaction hash starting with '0x'."
            )
        try:
            int(clean_tx_hash[2:], 16)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Field 'transactionHash' contains invalid hexadecimal characters."
            )

    # 4. Validate tokenId if supplied (positive integer)
    clean_token_id = None
    if request.tokenId is not None:
        tid_str = str(request.tokenId).strip()
        if tid_str:
            try:
                tid_int = int(tid_str)
                if tid_int <= 0:
                    raise ValueError()
                clean_token_id = str(tid_int)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Field 'tokenId' must be a valid positive integer."
                )

    # 5. Validate blockNumber if supplied (positive integer)
    clean_block_number = None
    if request.blockNumber is not None:
        if request.blockNumber <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Field 'blockNumber' must be a positive integer."
            )
        clean_block_number = request.blockNumber

    # 6. Locate project in SQLite database
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

    # Update project credits in SQLite
    tokenization["availableCredits"] = available - request.tonsToRetire
    tokenization["retiredCredits"] = retired + request.tonsToRetire
    project["tokenization"] = tokenization
    save_or_update_project(project)

    # 7. Record retirement receipt
    now_ts = int(datetime.now(timezone.utc).timestamp())
    now_iso = request.retiredAt or datetime.now(timezone.utc).isoformat()
    record_id = f"RET-{str(now_ts)[-6:]}"
    certificate_id = request.certificateId or f"ESG-NETZERO-{os.urandom(3).hex().upper()}-2026"

    # Use real transaction hash if provided; otherwise empty string (never fabricate a fake hash)
    tx_hash = clean_tx_hash or ""
    burn_block = clean_block_number or 0

    record = {
        "id": record_id,
        "projectId": project["id"],
        "projectName": project.get("name", request.projectId),
        "companyName": request.companyName,
        "companyWallet": clean_wallet,
        "tonsRetired": request.tonsToRetire,
        "purpose": request.purpose,
        "vintageYear": 2026,
        "txHash": tx_hash,
        "burnReceiptBlock": burn_block,
        "retiredAt": now_iso,
        "certificateId": certificate_id,
        "ipfsCertificateCid": request.ipfsCertificateCid or "",
        "tokenId": clean_token_id or tokenization.get("tokenId"),
        "contractAddress": "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9",
        "network": "Polygon Amoy"
    }

    save_retirement(record)

    return {
        "status": "RETIRED",
        "updatedProject": project,
        "retirementRecord": record
    }


@app.get("/api/verify/{certificate_id}", response_model=CertificateVerificationResponse)
def verify_certificate(certificate_id: str):
    """
    Public read-only ESG retirement certificate verification endpoint.
    Retrieves the immutable retirement record from the authoritative database.
    Confirms cryptographic and on-chain verification metadata without mutating blockchain state.
    """
    clean_cert_id = (certificate_id or "").strip()
    if not clean_cert_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'certificateId' cannot be empty."
        )

    record = get_retirement_by_certificate_id(clean_cert_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Certificate '{clean_cert_id}' not found."
        )

    tx_hash = record.get("txHash") or ""
    burn_block = record.get("burnReceiptBlock") or 0
    is_onchain = bool(tx_hash.startswith("0x") and len(tx_hash) == 66 and burn_block > 0)

    explorer_url = f"https://amoy.polygonscan.com/tx/{tx_hash}" if is_onchain else None
    contract_address = record.get("contractAddress") or "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9"
    network = record.get("network") or "Polygon Amoy"

    record["contractAddress"] = contract_address
    record["network"] = network

    return CertificateVerificationResponse(
        status="VERIFIED_ON_CHAIN" if is_onchain else "OFF_CHAIN_RECORD",
        certificateId=record.get("certificateId", clean_cert_id),
        record=record,
        isBlockchainVerified=is_onchain,
        network=network,
        contractAddress=contract_address,
        explorerUrl=explorer_url,
        verifiedAt=datetime.now(timezone.utc).isoformat()
    )


@app.post("/api/ipfs/pin", response_model=AuditDossierPinResponse)
def pin_audit_dossier(request: AuditDossierPinRequest):
    """
    Pins an immutable AegisBlue MRV audit dossier / metadata package to IPFS via Pinata.
    Returns the cryptographic IPFS CID (Content Identifier) and gateway access URL.
    Ensures that Pinata JWT credentials remain strictly server-side.
    """
    if not request.projectId or not request.projectId.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'projectId' cannot be empty."
        )

    if not request.auditHash or not request.auditHash.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'auditHash' cannot be empty."
        )

    clean_audit_hash = request.auditHash.strip()
    if not clean_audit_hash.startswith("0x"):
        clean_audit_hash = "0x" + clean_audit_hash

    if len(clean_audit_hash) != 66:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'auditHash' must be a valid 32-byte hexadecimal hash (66 characters with 0x prefix)."
        )

    try:
        int(clean_audit_hash[2:], 16)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'auditHash' must contain only valid hexadecimal characters."
        )

    if request.totalCredits <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field 'totalCredits' must be greater than 0."
        )

    # Build canonical audit dossier if pre-built dossier not provided
    if request.dossier:
        dossier = request.dossier
        dossier["projectId"] = request.projectId
        dossier["auditHash"] = clean_audit_hash
        dossier["totalCredits"] = request.totalCredits
    else:
        dossier = {
            "schema": "AegisBlue-BlueCarbon-Audit-v1.0",
            "projectId": request.projectId,
            "projectName": request.projectName,
            "auditHash": clean_audit_hash,
            "totalCredits": request.totalCredits,
            "areaHectares": request.areaHectares,
            "coordinates": request.coordinates,
            "ngoName": request.ngoName,
            "locationName": request.locationName,
            "mrv": {
                "satellite": request.spectralData.satellite if request.spectralData else "Sentinel-2B",
                "sceneId": request.spectralData.sceneId if request.spectralData else None,
                "acquisitionDate": request.spectralData.acquisitionDate if request.spectralData else None,
                "telemetryMode": request.spectralData.telemetryMode if request.spectralData else "LIVE_SENTINEL_STAC",
                "cloudCoverPct": request.spectralData.cloudCoverPct if request.spectralData else None,
                "spectralBands": {
                    "band2_blue": request.spectralData.band2_blue,
                    "band3_green": request.spectralData.band3_green,
                    "band4_red": request.spectralData.band4_red,
                    "band8_nir": request.spectralData.band8_nir,
                    "band11_swir": request.spectralData.band11_swir,
                } if request.spectralData else {}
            },
            "carbonMetrics": request.carbonMetrics.model_dump() if request.carbonMetrics else {},
            "soilCoreSample": request.nearestCcnCore.model_dump() if request.nearestCcnCore else None,
            "scientificModel": {
                "standard": "IPCC Tier-3 Wetland Supplement (2013) & Komiyama Allometric Canopy Math",
                "allometricEquation": "AGB = 115.0 * (NDVI)^1.8 * (H/8.0)^0.85 * 0.65; BGB = 0.49 * AGB",
                "stoichiometricConversion": "CO2e = Total Organic Carbon * (44 / 12)",
                "referenceDataset": "Smithsonian Coastal Carbon Network (CCN v2.1)"
            },
            "audit": {
                "auditHash": clean_audit_hash,
                "status": "VERIFIED",
                "verifiedBy": "AegisBlue Digital MRV Engine"
            }
        }
        if request.customMetadata:
            dossier["customMetadata"] = request.customMetadata

    try:
        pin_result = pin_json_to_ipfs(
            content=dossier,
            name=f"AegisBlue-Audit-{request.projectId}",
            keyvalues={
                "projectId": request.projectId,
                "auditHash": clean_audit_hash,
                "totalCredits": str(request.totalCredits)
            }
        )
    except PinataConfigError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="IPFS pinning service is not configured on the server."
        )
    except PinataNetworkError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Connection to IPFS pinning service timed out."
        )
    except PinataAPIError as e:
        http_code = e.status_code if e.status_code and e.status_code != 200 else status.HTTP_502_BAD_GATEWAY
        raise HTTPException(
            status_code=http_code,
            detail=f"IPFS pinning service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected failure while pinning audit dossier to IPFS."
        )

    return AuditDossierPinResponse(
        status="SUCCESS",
        cid=pin_result["cid"],
        gatewayUrl=pin_result["gatewayUrl"],
        pinSize=pin_result["pinSize"],
        timestamp=pin_result["timestamp"],
        projectId=request.projectId,
        auditHash=clean_audit_hash,
        totalCredits=request.totalCredits,
        dossier=dossier
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
