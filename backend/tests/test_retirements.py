import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path for test discovery
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from services.database import init_db, save_or_update_project, get_project_by_id

# Initialize database schema for test execution
init_db()
client = TestClient(app)

TEST_PROJECT_ID = "TEST-PICHAVARAM-RET-01"
TEST_TOKEN_ID = "7300511014531487208209184491691875089324748676569431105539752191596868391902"
VALID_TX_HASH = "0xb2942f936e9920acab30dea9f5bba856067e85949017fbb736b8662f605f1b90"
VALID_WALLET = "0x5f05Afd47769c5d5e332b026D33883a004C2cc68"

@pytest.fixture(autouse=True)
def setup_test_project():
    """Seeds a fresh test project with 100 available credits before each test."""
    project_payload = {
        "id": TEST_PROJECT_ID,
        "name": "Pichavaram Estuarine Rhizophora Expansion Test",
        "ngoName": "Tamil Nadu Coastal Foundation",
        "ngoWallet": VALID_WALLET,
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
            "projectTotalCO2Tons": 100.0,
            "confidenceScore": 97.8,
            "historicalTrend": [],
            "auditHash": "0x5d41402abc4b2a76b9719d911017c59223838491823901928301928301928301",
            "auditedAt": "2026-09-11T00:00:00Z"
        },
        "ipfs": {
            "cid": "bafkreid3n64zywg4nud5z3oq2vla5fuiwa75pszuxpv7mjx4w3cxs5ezzq",
            "gatewayUrl": "https://gateway.pinata.cloud/ipfs/bafkreid3n64zywg4nud5z3oq2vla5fuiwa75pszuxpv7mjx4w3cxs5ezzq",
            "payloadSizeKb": 12.4,
            "pinnedAt": "2026-09-11T00:00:00Z",
            "metadata": {}
        },
        "tokenization": {
            "tokenId": TEST_TOKEN_ID,
            "contractAddress": "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9",
            "network": "Polygon Amoy Testnet",
            "totalMinted": 100.0,
            "availableCredits": 100.0,
            "retiredCredits": 0.0,
            "pricePerTonUSD": 29.5,
            "txHash": "0x5deb7af620ac53bad6fa6d9acb611605f7cab71ce1bb74b830de71b698c0217d",
            "blockNumber": 47242269,
            "mintedAt": "2026-09-11T00:00:00Z"
        },
        "coBenefits": ["Prawn & Fishery Nursery", "Wave Attenuation"],
        "status": "LISTED"
    }
    save_or_update_project(project_payload)


class TestRetirementsAPI:
    """Comprehensive test suite for POST /api/retirements validation and execution."""

    def test_valid_retirement_with_full_metadata(self):
        """1. Valid retirement with wallet, tokenId, real-format tx hash, blockNumber, and amount."""
        payload = {
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 10.0,
            "companyName": "Tata Consultancy Services - ESG Scope 1",
            "companyWallet": VALID_WALLET,
            "purpose": "BRSR FY26 Coastal Decarbonization Claim",
            "tokenId": TEST_TOKEN_ID,
            "transactionHash": VALID_TX_HASH,
            "blockNumber": 47242300,
            "retiredAt": "2026-09-11T00:10:00Z",
            "certificateId": "ESG-NETZERO-TCS-001",
            "ipfsCertificateCid": "bafybeigtestcid77x1"
        }

        response = client.post("/api/retirements", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "RETIRED"

        rec = data["retirementRecord"]
        assert rec["projectId"] == TEST_PROJECT_ID
        assert rec["tonsRetired"] == 10.0
        assert rec["companyWallet"] == VALID_WALLET
        assert rec["txHash"] == VALID_TX_HASH
        assert rec["burnReceiptBlock"] == 47242300
        assert rec["tokenId"] == TEST_TOKEN_ID
        assert rec["certificateId"] == "ESG-NETZERO-TCS-001"
        assert rec["ipfsCertificateCid"] == "bafybeigtestcid77x1"

        # Verify updated project in SQLite
        updated_proj = data["updatedProject"]
        assert updated_proj["tokenization"]["availableCredits"] == 90.0
        assert updated_proj["tokenization"]["retiredCredits"] == 10.0

    def test_invalid_transaction_hash_missing_0x(self):
        """2a. Rejects transactionHash missing 0x prefix."""
        payload = {
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme Corp",
            "companyWallet": VALID_WALLET,
            "purpose": "Carbon Offset",
            "transactionHash": VALID_TX_HASH[2:]  # 64 chars, missing 0x
        }
        response = client.post("/api/retirements", json=payload)
        assert response.status_code == 400
        assert "transactionHash" in response.json()["detail"]

    def test_invalid_transaction_hash_incorrect_length(self):
        """2b. Rejects transactionHash with incorrect length."""
        payload = {
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme Corp",
            "companyWallet": VALID_WALLET,
            "purpose": "Carbon Offset",
            "transactionHash": "0x1234abcd"  # Too short
        }
        response = client.post("/api/retirements", json=payload)
        assert response.status_code == 400
        assert "transactionHash" in response.json()["detail"]

    def test_invalid_transaction_hash_invalid_hex(self):
        """2c. Rejects transactionHash containing non-hex characters."""
        # 66 chars with non-hex characters 'zz'
        bad_hash = "0x" + "z" * 64
        payload = {
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme Corp",
            "companyWallet": VALID_WALLET,
            "purpose": "Carbon Offset",
            "transactionHash": bad_hash
        }
        response = client.post("/api/retirements", json=payload)
        assert response.status_code == 400
        assert "transactionHash" in response.json()["detail"]

    def test_invalid_wallet_address_formats(self):
        """3. Rejects invalid companyWallet formats (missing 0x, incorrect length, invalid hex)."""
        # Missing 0x
        res1 = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET[2:],
            "purpose": "Test"
        })
        assert res1.status_code == 400
        assert "companyWallet" in res1.json()["detail"]

        # Too short
        res2 = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme",
            "companyWallet": "0x1234",
            "purpose": "Test"
        })
        assert res2.status_code == 400
        assert "companyWallet" in res2.json()["detail"]

        # Invalid hex
        res3 = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme",
            "companyWallet": "0x" + "g" * 40,
            "purpose": "Test"
        })
        assert res3.status_code == 400
        assert "companyWallet" in res3.json()["detail"]

    def test_zero_retirement_amount_rejected(self):
        """4. Rejects retirement amount equal to zero."""
        payload = {
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 0.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Test"
        }
        response = client.post("/api/retirements", json=payload)
        assert response.status_code == 400
        assert "tonsToRetire" in response.json()["detail"]

    def test_negative_retirement_amount_rejected(self):
        """5. Rejects negative retirement amount."""
        payload = {
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": -15.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Test"
        }
        response = client.post("/api/retirements", json=payload)
        assert response.status_code == 400
        assert "tonsToRetire" in response.json()["detail"]

    def test_invalid_token_id_rejected(self):
        """6. Rejects non-integer, zero, or negative tokenId."""
        # Non-integer string
        res1 = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Test",
            "tokenId": "INVALID_TOKEN_ID"
        })
        assert res1.status_code == 400
        assert "tokenId" in res1.json()["detail"]

        # Zero tokenId
        res2 = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Test",
            "tokenId": "0"
        })
        assert res2.status_code == 400
        assert "tokenId" in res2.json()["detail"]

    def test_invalid_block_number_rejected(self):
        """7. Rejects negative or zero blockNumber."""
        res = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 5.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Test",
            "blockNumber": -100
        })
        assert res.status_code == 400
        assert "blockNumber" in res.json()["detail"]

    def test_project_available_balance_decrement_and_limit(self):
        """8. Verifies balance decrementing and rejection if amount exceeds availableCredits."""
        # First retirement of 60 tons (from 100 available)
        res1 = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 60.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Batch 1"
        })
        assert res1.status_code == 200
        assert res1.json()["updatedProject"]["tokenization"]["availableCredits"] == 40.0
        assert res1.json()["updatedProject"]["tokenization"]["retiredCredits"] == 60.0

        # Attempting to retire 50 tons when only 40 are available must fail
        res2 = client.post("/api/retirements", json={
            "projectId": TEST_PROJECT_ID,
            "tonsToRetire": 50.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Batch 2"
        })
        assert res2.status_code == 400
        assert "exceeds available pool" in res2.json()["detail"]

    def test_nonexistent_project_rejected_with_404(self):
        """Verifies that attempting retirement for an unknown project ID returns 404."""
        res = client.post("/api/retirements", json={
            "projectId": "UNKNOWN-PROJECT-9999",
            "tonsToRetire": 10.0,
            "companyName": "Acme",
            "companyWallet": VALID_WALLET,
            "purpose": "Test"
        })
        assert res.status_code == 404
        assert "not found" in res.json()["detail"]
