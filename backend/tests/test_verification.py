import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path for test discovery
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from services.database import init_db, save_or_update_project, save_retirement

init_db()
client = TestClient(app)

TEST_PROJECT_ID = "TEST-VERIFY-PROJ-01"
TEST_TOKEN_ID = "7300511014531487208209184491691875089324748676569431105539752191596868391902"
REAL_TX_HASH = "0xb2942f936e9920acab30dea9f5bba856067e85949017fbb736b8662f605f1b90"
REAL_WALLET = "0x5f05Afd47769c5d5e332b026D33883a004C2cc68"
CONTRACT_ADDR = "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9"

@pytest.fixture(autouse=True)
def setup_test_records():
    """Seeds test project and sample retirement records."""
    project_payload = {
        "id": TEST_PROJECT_ID,
        "name": "Pichavaram Mangrove Test Sanctuary",
        "ngoName": "Tamil Nadu Coastal Foundation",
        "ngoWallet": REAL_WALLET,
        "ngoRegistrationNo": "TN-COAST-2024",
        "locationName": "Pichavaram Mangrove Wetlands",
        "coordinates": [[11.42, 79.77], [11.45, 79.80]],
        "areaHectares": 180.0,
        "boundaryResult": {
            "isValid": True,
            "overlapPercentage": 98.0,
            "totalAreaHa": 180.0,
            "warnings": [],
            "spatialConfidence": 98.0,
            "timestamp": "2026-09-11T00:00:00Z",
            "boundingBox": {"minLat": 11.42, "maxLat": 11.45, "minLng": 79.77, "maxLng": 79.80}
        },
        "spectralData": {
            "band2_blue": 0.06,
            "band3_green": 0.18,
            "band4_red": 0.08,
            "band8_nir": 0.58,
            "band11_swir": 0.12,
            "cloudCoverPct": 1.5,
            "acquisitionDate": "2026-09-01",
            "satellite": "Sentinel-2B",
            "telemetryMode": "LIVE_SENTINEL_STAC"
        },
        "carbonMetrics": {
            "ndvi": 0.758,
            "evi": 0.692,
            "ndre": 0.667,
            "canopyCoverPct": 87.2,
            "meanTreeHeightM": 13.0,
            "agbTonsPerHa": 98.4,
            "bgbTonsPerHa": 48.2,
            "socTonsPerHa": 20.6,
            "totalCarbonTonsPerHa": 89.5,
            "co2EquivalentPerHa": 328.2,
            "projectTotalCO2Tons": 59076.0,
            "confidenceScore": 97.8,
            "historicalTrend": [],
            "auditHash": "0x" + "a" * 64,
            "auditedAt": "2026-09-01T12:00:00Z"
        },
        "ipfs": {
            "cid": "bafkreitestcidforverification01",
            "gatewayUrl": "https://gateway.pinata.cloud/ipfs/bafkreitestcidforverification01",
            "payloadSizeKb": 12.5,
            "pinnedAt": "2026-09-01T12:00:00Z",
            "metadata": {}
        },
        "tokenization": {
            "tokenId": TEST_TOKEN_ID,
            "contractAddress": CONTRACT_ADDR,
            "network": "Polygon Amoy",
            "totalMinted": 100.0,
            "availableCredits": 90.0,
            "retiredCredits": 10.0,
            "pricePerTonUSD": 28.50,
            "txHash": REAL_TX_HASH,
            "blockNumber": 47242100,
            "mintedAt": "2026-09-11T00:00:00Z"
        },
        "status": "LISTED"
    }
    save_or_update_project(project_payload)

    # 1. Real on-chain burn record
    onchain_rec = {
        "id": "RET-TEST-001",
        "projectId": TEST_PROJECT_ID,
        "projectName": "Pichavaram Mangrove Test Sanctuary",
        "companyName": "Tata Consultancy Services - ESG Scope 1",
        "companyWallet": REAL_WALLET,
        "tonsRetired": 10.0,
        "purpose": "SEBI BRSR FY26 Net-Zero Compliance",
        "vintageYear": 2026,
        "txHash": REAL_TX_HASH,
        "burnReceiptBlock": 47242300,
        "retiredAt": "2026-09-11T00:10:00Z",
        "certificateId": "ESG-NETZERO-TCS-TEST-2026",
        "ipfsCertificateCid": "bafybeigtestcid77x1",
        "tokenId": TEST_TOKEN_ID,
        "contractAddress": CONTRACT_ADDR,
        "network": "Polygon Amoy"
    }
    save_retirement(onchain_rec)

    # 2. Legacy off-chain simulated record
    offchain_rec = {
        "id": "RET-TEST-002",
        "projectId": TEST_PROJECT_ID,
        "projectName": "Pichavaram Mangrove Test Sanctuary",
        "companyName": "Legacy Demo Partner",
        "companyWallet": REAL_WALLET,
        "tonsRetired": 5.0,
        "purpose": "Simulated Demo Retirement",
        "vintageYear": 2026,
        "txHash": "",
        "burnReceiptBlock": 0,
        "retiredAt": "2026-09-10T12:00:00Z",
        "certificateId": "ESG-NETZERO-OFFCHAIN-2026",
        "ipfsCertificateCid": "",
        "tokenId": TEST_TOKEN_ID,
        "contractAddress": CONTRACT_ADDR,
        "network": "Polygon Amoy"
    }
    save_retirement(offchain_rec)


def test_verify_onchain_certificate_success():
    """Confirms that a real on-chain retirement certificate returns VERIFIED_ON_CHAIN status with complete metadata."""
    res = client.get("/api/verify/ESG-NETZERO-TCS-TEST-2026")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "VERIFIED_ON_CHAIN"
    assert data["certificateId"] == "ESG-NETZERO-TCS-TEST-2026"
    assert data["isBlockchainVerified"] is True
    assert data["contractAddress"] == CONTRACT_ADDR
    assert data["network"] == "Polygon Amoy"
    assert "https://amoy.polygonscan.com/tx/" in data["explorerUrl"]
    assert REAL_TX_HASH in data["explorerUrl"]

    record = data["record"]
    assert record["companyName"] == "Tata Consultancy Services - ESG Scope 1"
    assert record["tonsRetired"] == 10.0
    assert record["txHash"] == REAL_TX_HASH
    assert record["burnReceiptBlock"] == 47242300
    assert record["tokenId"] == TEST_TOKEN_ID


def test_verify_offchain_certificate():
    """Confirms that a legacy off-chain record is accurately marked as OFF_CHAIN_RECORD without fabricating hashes."""
    res = client.get("/api/verify/ESG-NETZERO-OFFCHAIN-2026")
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "OFF_CHAIN_RECORD"
    assert data["certificateId"] == "ESG-NETZERO-OFFCHAIN-2026"
    assert data["isBlockchainVerified"] is False
    assert data["explorerUrl"] is None

    record = data["record"]
    assert record["txHash"] == ""
    assert record["burnReceiptBlock"] == 0


def test_verify_case_insensitive_lookup():
    """Confirms that certificate ID lookup is resilient and case-insensitive."""
    res = client.get("/api/verify/esg-netzero-tcs-test-2026")
    assert res.status_code == 200
    data = res.json()
    assert data["certificateId"] == "ESG-NETZERO-TCS-TEST-2026"
    assert data["isBlockchainVerified"] is True


def test_verify_nonexistent_certificate_404():
    """Confirms that an unknown certificate ID returns a clean 404 error."""
    res = client.get("/api/verify/ESG-NONEXISTENT-999999-2026")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_verify_whitespace_certificate_id_400():
    """Confirms that an empty or whitespace certificate ID is rejected."""
    res = client.get("/api/verify/%20%20")
    assert res.status_code == 400
    assert "cannot be empty" in res.json()["detail"].lower()


def test_retire_attaches_contract_and_network_metadata():
    """Confirms that POST /api/retirements attaches contractAddress and network to newly created records."""
    req_body = {
        "projectId": TEST_PROJECT_ID,
        "tonsToRetire": 2.0,
        "companyName": "Wipro Green Operations",
        "companyWallet": REAL_WALLET,
        "purpose": "Scope 2 Data Center Neutralization",
        "tokenId": TEST_TOKEN_ID,
        "transactionHash": REAL_TX_HASH,
        "blockNumber": 47242400,
        "certificateId": "ESG-NETZERO-WIPRO-2026"
    }
    res = client.post("/api/retirements", json=req_body)
    assert res.status_code == 200
    rec = res.json()["retirementRecord"]
    assert rec["contractAddress"] == CONTRACT_ADDR
    assert rec["network"] == "Polygon Amoy"
    assert rec["certificateId"] == "ESG-NETZERO-WIPRO-2026"
    assert rec["txHash"] == REAL_TX_HASH
    assert rec["burnReceiptBlock"] == 47242400

    # Verify lookup via GET /api/verify
    verify_res = client.get("/api/verify/ESG-NETZERO-WIPRO-2026")
    assert verify_res.status_code == 200
    assert verify_res.json()["isBlockchainVerified"] is True
