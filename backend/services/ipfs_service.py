import os
import logging
from typing import Dict, Any, Optional
import requests

logger = logging.getLogger("aegisblue.ipfs")

PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
DEFAULT_GATEWAY_URL = "https://gateway.pinata.cloud/ipfs/"

class PinataError(Exception):
    """Base exception for Pinata IPFS service operations."""
    pass

class PinataConfigError(PinataError):
    """Raised when Pinata credentials or environment settings are missing or misconfigured."""
    pass

class PinataNetworkError(PinataError):
    """Raised when a network timeout or connection failure occurs while contacting Pinata."""
    pass

class PinataAPIError(PinataError):
    """Raised when Pinata API responds with an HTTP error status code."""
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code

def get_pinata_jwt() -> str:
    """
    Retrieves the Pinata JWT secret from server-side environment variables.
    Raises PinataConfigError if unset or empty.
    """
    jwt = os.environ.get("PINATA_JWT", "").strip()
    if not jwt:
        raise PinataConfigError("PINATA_JWT environment variable is not configured on the server.")
    return jwt

def get_gateway_url() -> str:
    """Retrieves the IPFS gateway base URL from environment or defaults to Pinata public gateway."""
    gateway = os.environ.get("PINATA_GATEWAY_URL", DEFAULT_GATEWAY_URL).strip()
    if not gateway.endswith("/"):
        gateway += "/"
    return gateway

def pin_json_to_ipfs(
    content: Dict[str, Any],
    name: Optional[str] = None,
    keyvalues: Optional[Dict[str, str]] = None,
    cid_version: int = 1,
    timeout: float = 15.0
) -> Dict[str, Any]:
    """
    Pins arbitrary JSON content to IPFS via Pinata pinning service.
    
    Returns a dictionary containing:
        - cid: The IPFS CID string (IpfsHash)
        - gatewayUrl: Full URL to access content on configured gateway
        - pinSize: Size of pinned artifact in bytes
        - timestamp: Pinning timestamp
        - pinnedContent: The actual content JSON stored
    """
    if not isinstance(content, dict):
        raise ValueError("IPFS content payload must be a non-empty dictionary.")

    jwt = get_pinata_jwt()
    item_name = name or f"AegisBlue-Audit-{content.get('projectId', 'artifact')}"

    payload = {
        "pinataContent": content,
        "pinataMetadata": {
            "name": item_name,
            "keyvalues": keyvalues or {}
        },
        "pinataOptions": {
            "cidVersion": cid_version
        }
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {jwt}"
    }

    try:
        response = requests.post(
            PINATA_PIN_JSON_URL,
            json=payload,
            headers=headers,
            timeout=timeout
        )
    except requests.Timeout as e:
        logger.error("Pinata IPFS request timed out after %s seconds", timeout)
        raise PinataNetworkError("Connection to Pinata IPFS pinning service timed out.") from e
    except requests.RequestException as e:
        logger.error("Pinata IPFS network request failed: %s", type(e).__name__)
        raise PinataNetworkError("Failed to communicate with Pinata IPFS pinning service.") from e

    if response.status_code != 200:
        logger.error("Pinata returned HTTP status %s", response.status_code)
        if response.status_code in (401, 403):
            raise PinataAPIError(
                "Pinata authentication failed. Please verify the server PINATA_JWT configuration.",
                status_code=response.status_code
            )
        error_msg = "Pinata API returned an error"
        try:
            err_json = response.json()
            if "error" in err_json:
                error_msg = f"Pinata error: {err_json['error']}"
        except Exception:
            pass
        raise PinataAPIError(error_msg, status_code=response.status_code)

    try:
        data = response.json()
    except Exception as e:
        logger.error("Failed to parse Pinata response as JSON")
        raise PinataAPIError("Received malformed JSON response from Pinata.") from e

    ipfs_hash = data.get("IpfsHash")
    if not ipfs_hash:
        raise PinataAPIError("Pinata response did not contain an IpfsHash.")

    gateway_url = get_gateway_url()
    full_url = f"{gateway_url}{ipfs_hash}"

    return {
        "cid": ipfs_hash,
        "gatewayUrl": full_url,
        "pinSize": data.get("PinSize", 0),
        "timestamp": data.get("Timestamp", ""),
        "pinnedContent": content
    }
