import os
import sys
from unittest.mock import patch, MagicMock

# Ensure backend root is on sys.path for test discovery
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
import requests

from main import app
from services.database import init_db
from services.ipfs_service import (
    pin_json_to_ipfs,
    PinataConfigError,
    PinataNetworkError,
    PinataAPIError,
    get_pinata_jwt
)

# Initialize database schema for test client execution
init_db()
client = TestClient(app)

SAMPLE_PROJECT_ID = "AEGIS-SUNDARBANS-001"
SAMPLE_AUDIT_HASH = "0x5d41402abc4b2a76b9719d911017c59223838491823901928301928301928301"
SAMPLE_TOTAL_CREDITS = 5000.0

SAMPLE_PAYLOAD = {
    "projectId": SAMPLE_PROJECT_ID,
    "auditHash": SAMPLE_AUDIT_HASH,
    "totalCredits": SAMPLE_TOTAL_CREDITS,
    "projectName": "Sundarbans Blue Carbon Restoration",
    "areaHectares": 120.5,
    "coordinates": [[21.94, 89.18], [21.95, 89.19]],
    "spectralData": {
        "band2_blue": 0.06,
        "band3_green": 0.18,
        "band4_red": 0.08,
        "band8_nir": 0.58,
        "band11_swir": 0.12,
        "cloudCoverPct": 1.5,
        "acquisitionDate": "2026-03-01",
        "satellite": "Sentinel-2B",
        "telemetryMode": "LIVE_SENTINEL_STAC"
    },
    "carbonMetrics": {
        "ndvi": 0.757,
        "evi": 0.582,
        "ndre": 0.666,
        "canopyCoverPct": 71.4,
        "meanTreeHeightM": 11.5,
        "agbTonsPerHa": 82.3,
        "bgbTonsPerHa": 40.3,
        "socTonsPerHa": 19.5,
        "totalCarbonTonsPerHa": 77.1,
        "co2EquivalentPerHa": 282.7,
        "projectTotalCO2Tons": 5000.0,
        "confidenceScore": 98.3,
        "historicalTrend": [
            {"year": 2024, "ndvi": 0.72, "co2Tons": 4500},
            {"year": 2026, "ndvi": 0.757, "co2Tons": 5000}
        ],
        "auditHash": SAMPLE_AUDIT_HASH,
        "auditedAt": "2026-03-01T12:00:00Z"
    }
}

class TestPinataServiceUnit:
    """Direct unit tests for services/ipfs_service.py functions."""

    def test_missing_pinata_jwt_raises_config_error(self):
        with patch.dict(os.environ, {}, clear=True):
            with pytest.raises(PinataConfigError) as excinfo:
                get_pinata_jwt()
            assert "PINATA_JWT" in str(excinfo.value)

    def test_pin_json_to_ipfs_successful(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "IpfsHash": "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
            "PinSize": 1024,
            "Timestamp": "2026-03-01T12:30:00.000Z"
        }

        with patch.dict(os.environ, {"PINATA_JWT": "fake_test_jwt_secret_value"}):
            with patch("requests.post", return_value=mock_response) as mock_post:
                result = pin_json_to_ipfs(
                    content={"testKey": "testVal", "projectId": "PROJ-1"},
                    name="TestItem"
                )

                assert result["cid"] == "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku"
                assert "gateway.pinata.cloud" in result["gatewayUrl"]
                assert result["pinSize"] == 1024
                assert result["timestamp"] == "2026-03-01T12:30:00.000Z"

                # Verify Authorization header uses Bearer with JWT
                mock_post.assert_called_once()
                call_headers = mock_post.call_args[1]["headers"]
                assert call_headers["Authorization"] == "Bearer fake_test_jwt_secret_value"

    def test_pin_json_to_ipfs_timeout_handling(self):
        with patch.dict(os.environ, {"PINATA_JWT": "fake_jwt"}):
            with patch("requests.post", side_effect=requests.Timeout("Connection timed out")):
                with pytest.raises(PinataNetworkError) as excinfo:
                    pin_json_to_ipfs({"test": "data"})
                assert "timed out" in str(excinfo.value)
                # Verify secret is NOT leaked in message
                assert "fake_jwt" not in str(excinfo.value)

    def test_pin_json_to_ipfs_auth_failure_handling(self):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {"error": "Unauthorized"}

        with patch.dict(os.environ, {"PINATA_JWT": "invalid_secret_jwt"}):
            with patch("requests.post", return_value=mock_response):
                with pytest.raises(PinataAPIError) as excinfo:
                    pin_json_to_ipfs({"test": "data"})
                assert "authentication failed" in str(excinfo.value).lower()
                assert excinfo.value.status_code == 401
                # Crucial security test: verify secret is not in the error message
                assert "invalid_secret_jwt" not in str(excinfo.value)


class TestIPFSPinEndpoint:
    """Integration tests for POST /api/ipfs/pin endpoint."""

    def test_missing_credentials_returns_503(self):
        with patch.dict(os.environ, {}, clear=True):
            response = client.post("/api/ipfs/pin", json=SAMPLE_PAYLOAD)
            assert response.status_code == 503
            data = response.json()
            assert "not configured" in data["detail"].lower()

    def test_successful_pin_returns_cid_and_dossier(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "IpfsHash": "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
            "PinSize": 2048,
            "Timestamp": "2026-03-01T12:00:00.000Z"
        }

        with patch.dict(os.environ, {"PINATA_JWT": "fake_production_simulated_jwt"}):
            with patch("requests.post", return_value=mock_response):
                response = client.post("/api/ipfs/pin", json=SAMPLE_PAYLOAD)
                assert response.status_code == 200
                data = response.json()
                assert data["status"] == "SUCCESS"
                assert data["cid"] == "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku"
                assert data["projectId"] == SAMPLE_PROJECT_ID
                assert data["auditHash"] == SAMPLE_AUDIT_HASH
                assert data["totalCredits"] == SAMPLE_TOTAL_CREDITS
                assert "dossier" in data
                assert data["dossier"]["projectId"] == SAMPLE_PROJECT_ID
                assert data["dossier"]["auditHash"] == SAMPLE_AUDIT_HASH
                assert "mrv" in data["dossier"]
                assert "scientificModel" in data["dossier"]

    def test_rejects_empty_project_id(self):
        payload = dict(SAMPLE_PAYLOAD, projectId="")
        with patch.dict(os.environ, {"PINATA_JWT": "fake_jwt"}):
            response = client.post("/api/ipfs/pin", json=payload)
            assert response.status_code == 400
            assert "projectId" in response.json()["detail"]

    def test_rejects_empty_audit_hash(self):
        payload = dict(SAMPLE_PAYLOAD, auditHash="")
        with patch.dict(os.environ, {"PINATA_JWT": "fake_jwt"}):
            response = client.post("/api/ipfs/pin", json=payload)
            assert response.status_code == 400
            assert "auditHash" in response.json()["detail"]

    def test_rejects_malformed_audit_hash_length(self):
        # 31 bytes instead of 32
        payload = dict(SAMPLE_PAYLOAD, auditHash="0x12345678")
        with patch.dict(os.environ, {"PINATA_JWT": "fake_jwt"}):
            response = client.post("/api/ipfs/pin", json=payload)
            assert response.status_code == 400
            assert "32-byte" in response.json()["detail"]

    def test_rejects_non_hex_audit_hash(self):
        # 66 characters but non-hex
        payload = dict(SAMPLE_PAYLOAD, auditHash="0x" + "z" * 64)
        with patch.dict(os.environ, {"PINATA_JWT": "fake_jwt"}):
            response = client.post("/api/ipfs/pin", json=payload)
            assert response.status_code == 400
            assert "hexadecimal" in response.json()["detail"]

    def test_rejects_zero_or_negative_total_credits(self):
        payload = dict(SAMPLE_PAYLOAD, totalCredits=0)
        with patch.dict(os.environ, {"PINATA_JWT": "fake_jwt"}):
            response = client.post("/api/ipfs/pin", json=payload)
            assert response.status_code == 400
            assert "totalCredits" in response.json()["detail"]

    def test_handles_pinata_api_network_timeout_cleanly(self):
        with patch.dict(os.environ, {"PINATA_JWT": "super_secret_jwt_token_123"}):
            with patch("requests.post", side_effect=requests.Timeout("Connection timed out")):
                response = client.post("/api/ipfs/pin", json=SAMPLE_PAYLOAD)
                assert response.status_code == 504
                assert "timed out" in response.json()["detail"].lower()
                assert "super_secret_jwt_token_123" not in response.text

    def test_handles_pinata_api_auth_failure_cleanly(self):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.json.return_value = {"error": "Invalid JWT token"}

        with patch.dict(os.environ, {"PINATA_JWT": "super_secret_jwt_token_123"}):
            with patch("requests.post", return_value=mock_response):
                response = client.post("/api/ipfs/pin", json=SAMPLE_PAYLOAD)
                assert response.status_code == 401
                assert "authentication failed" in response.json()["detail"].lower()
                assert "super_secret_jwt_token_123" not in response.text

    def test_existing_endpoints_unaffected(self):
        # Verify /health continues to operate
        health_resp = client.get("/health")
        assert health_resp.status_code == 200
        assert health_resp.json()["status"] == "HEALTHY"

        # Verify /api/projects endpoint
        projects_resp = client.get("/api/projects")
        assert projects_resp.status_code == 200
        assert isinstance(projects_resp.json(), list)

        # Verify /api/retirements endpoint
        retirements_resp = client.get("/api/retirements")
        assert retirements_resp.status_code == 200
        assert isinstance(retirements_resp.json(), list)
