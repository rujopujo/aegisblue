import sqlite3
import json
import os
from typing import List, Optional, Dict, Any

DB_PATH = os.environ.get("AEGISBLUE_DB_PATH", "aegisblue.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

DEFAULT_RETIREMENTS: List[Dict[str, Any]] = [
    {
        "id": "RET-884910",
        "projectId": "PROJ-SUN-2026-01",
        "projectName": "Sundarbans Core Tiger Reserve Blue Carbon Restoration",
        "companyName": "Infosys ESG & Green Data Hubs",
        "companyWallet": "0x992451FaE6a5B49d88c42b109D4EaB7f02d4D14E",
        "tonsRetired": 1250.0,
        "purpose": "Scope 1 & 2 Neutralization for Bangalore Data Centers (Q1 2026)",
        "vintageYear": 2026,
        "txHash": "0x94f1c79a83b2e5917a4c6012e8b093fa71b29a01f5c381792d4b8e21a0f918e2",
        "burnReceiptBlock": 14892410,
        "retiredAt": "2026-08-20T10:14:00Z",
        "certificateId": "ESG-NETZERO-INF992-2026",
        "ipfsCertificateCid": "bafybeih442x9k2v7burninf992m8a1b5c2",
        "tokenId": "7300511014531487208209184491691875089324748676569431105539752191596868391901",
        "contractAddress": "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9",
        "network": "Polygon Amoy"
    },
    {
        "id": "RET-884911",
        "projectId": "AEGIS-PICHAVARAMESTUAR-180",
        "projectName": "Pichavaram Estuarine Rhizophora Expansion",
        "companyName": "Tata Motors Green Mobility Wing",
        "companyWallet": "0x43B215E9110778B5ca65C87c53dF92aB171888FA",
        "tonsRetired": 800.0,
        "purpose": "Zero Emission EV Supply Chain Decarbonization Offset",
        "vintageYear": 2026,
        "txHash": "0x12c8a93e507b9148d2f1094ba72c019485b31f79c2a8e410b981f4a9238c11e4",
        "burnReceiptBlock": 14892550,
        "retiredAt": "2026-08-24T14:30:00Z",
        "certificateId": "ESG-NETZERO-TAT43B-2026",
        "ipfsCertificateCid": "bafybeic771v8m3w4burntat43bm1x9c3d4",
        "tokenId": "7300511014531487208209184491691875089324748676569431105539752191596868391902",
        "contractAddress": "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9",
        "network": "Polygon Amoy"
    }
]

DEFAULT_PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "PROJ-SUN-2026-01",
        "name": "Sundarbans Core Tiger Reserve Blue Carbon Restoration",
        "ngoName": "Sundarbans Mangrove Climate Alliance (SMCA)",
        "ngoWallet": "0x3B88e63F9D661d9a244C3A73Ec5D875F7925e510",
        "ngoRegistrationNo": "WB-NGO-ENV-2021-9941",
        "locationName": "Sundarbans Biosphere Reserve, West Bengal",
        "coordinates": [[21.88, 88.73], [21.88, 88.78], [21.93, 88.78], [21.93, 88.73], [21.88, 88.73]],
        "areaHectares": 450.0,
        "boundaryResult": {
            "isValid": True,
            "overlapPercentage": 99.2,
            "totalAreaHa": 450.0,
            "warnings": [],
            "spatialConfidence": 98.6,
            "timestamp": "2026-08-01T00:00:00Z",
            "boundingBox": {"minLat": 21.88, "maxLat": 21.93, "minLng": 88.73, "maxLng": 88.78}
        },
        "spectralData": {
            "band2_blue": 0.05,
            "band3_green": 0.17,
            "band4_red": 0.07,
            "band8_nir": 0.59,
            "band11_swir": 0.11,
            "cloudCoverPct": 2.1,
            "acquisitionDate": "2026-08-01",
            "satellite": "Sentinel-2B",
            "telemetryMode": "LIVE_SENTINEL_STAC"
        },
        "carbonMetrics": {
            "ndvi": 0.78,
            "evi": 0.71,
            "ndre": 0.68,
            "canopyCoverPct": 88.5,
            "meanTreeHeightM": 14.2,
            "agbTonsPerHa": 105.0,
            "bgbTonsPerHa": 52.0,
            "socTonsPerHa": 22.0,
            "totalCarbonTonsPerHa": 98.0,
            "co2EquivalentPerHa": 359.3,
            "projectTotalCO2Tons": 161685.0,
            "confidenceScore": 98.2,
            "historicalTrend": [],
            "auditHash": "0x" + "b" * 64,
            "auditedAt": "2026-08-01T12:00:00Z"
        },
        "ipfs": {
            "cid": "bafybeih442x9k2v7burninf992m8a1b5c2",
            "gatewayUrl": "https://gateway.pinata.cloud/ipfs/bafybeih442x9k2v7burninf992m8a1b5c2",
            "payloadSizeKb": 18.2,
            "pinnedAt": "2026-08-01T12:00:00Z",
            "metadata": {}
        },
        "tokenization": {
            "tokenId": "7300511014531487208209184491691875089324748676569431105539752191596868391901",
            "contractAddress": "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9",
            "network": "Polygon Amoy",
            "totalMinted": 14400.0,
            "availableCredits": 13150.0,
            "retiredCredits": 1250.0,
            "pricePerTonUSD": 32.0,
            "txHash": "0x94f1c79a83b2e5917a4c6012e8b093fa71b29a01f5c381792d4b8e21a0f918e2",
            "blockNumber": 14892400,
            "mintedAt": "2026-08-01T00:00:00Z"
        },
        "pricePerTonUSD": 32.0,
        "status": "LISTED"
    },
    {
        "id": "AEGIS-PICHAVARAMESTUAR-180",
        "name": "Pichavaram Estuarine Rhizophora Expansion",
        "ngoName": "Tamil Nadu Coastal Ecology Foundation",
        "ngoWallet": "0x5f05Afd47769c5d5e332b026D33883a004C2cc68",
        "ngoRegistrationNo": "TN-COAST-SOC-2019-4412",
        "locationName": "Pichavaram Mangrove Wetlands, Cuddalore, TN",
        "coordinates": [[11.42, 79.77], [11.42, 79.80], [11.45, 79.80], [11.45, 79.77], [11.42, 79.77]],
        "areaHectares": 180.0,
        "boundaryResult": {
            "isValid": True,
            "overlapPercentage": 98.0,
            "totalAreaHa": 180.0,
            "warnings": [],
            "spatialConfidence": 98.0,
            "timestamp": "2026-08-01T00:00:00Z",
            "boundingBox": {"minLat": 11.42, "maxLat": 11.45, "minLng": 79.77, "maxLng": 79.80}
        },
        "spectralData": {
            "band2_blue": 0.06,
            "band3_green": 0.18,
            "band4_red": 0.08,
            "band8_nir": 0.58,
            "band11_swir": 0.12,
            "cloudCoverPct": 1.5,
            "acquisitionDate": "2026-08-01",
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
            "auditedAt": "2026-08-01T12:00:00Z"
        },
        "ipfs": {
            "cid": "bafkreid3n64zywg4nud5z3oq2vla5fuiwa75pszuxpv7mjx4w3cxs5ezzq",
            "gatewayUrl": "https://gateway.pinata.cloud/ipfs/bafkreid3n64zywg4nud5z3oq2vla5fuiwa75pszuxpv7mjx4w3cxs5ezzq",
            "payloadSizeKb": 12.5,
            "pinnedAt": "2026-08-01T12:00:00Z",
            "metadata": {}
        },
        "tokenization": {
            "tokenId": "7300511014531487208209184491691875089324748676569431105539752191596868391902",
            "contractAddress": "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9",
            "network": "Polygon Amoy",
            "totalMinted": 100.0,
            "availableCredits": 100.0,
            "retiredCredits": 0.0,
            "pricePerTonUSD": 29.5,
            "txHash": "0x5deb7af620ac53bad6fa6d9acb611605f7cab71ce1bb74b830de71b698c0217d",
            "blockNumber": 47242269,
            "mintedAt": "2026-08-01T00:00:00Z"
        },
        "pricePerTonUSD": 29.5,
        "status": "LISTED"
    }
]

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            payload JSON NOT NULL,
            available_credits REAL NOT NULL,
            retired_credits REAL NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS retirements (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            company_name TEXT NOT NULL,
            tons_retired REAL NOT NULL,
            payload JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed default projects if table is empty
    cursor.execute("SELECT COUNT(*) AS cnt FROM projects")
    row_proj = cursor.fetchone()
    if row_proj and row_proj["cnt"] == 0:
        for p in DEFAULT_PROJECTS:
            cursor.execute("""
                INSERT INTO projects (id, name, payload, available_credits, retired_credits, updated_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (p["id"], p["name"], json.dumps(p), p["tokenization"]["availableCredits"], p["tokenization"]["retiredCredits"]))

    # Seed default retirements if table is empty
    cursor.execute("SELECT COUNT(*) AS cnt FROM retirements")
    row_ret = cursor.fetchone()
    if row_ret and row_ret["cnt"] == 0:
        for r in DEFAULT_RETIREMENTS:
            cursor.execute("""
                INSERT INTO retirements (id, project_id, company_name, tons_retired, payload, created_at)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (r["id"], r["projectId"], r["companyName"], r["tonsRetired"], json.dumps(r)))

    conn.commit()
    conn.close()

def get_all_projects() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT payload FROM projects ORDER BY updated_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(row["payload"]) for row in rows]

def get_project_by_id(project_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT payload FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row["payload"])
    return None

def save_or_update_project(project_dict: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()

    project_id = project_dict["id"]
    name = project_dict.get("name", "Unnamed Project")
    token_info = project_dict.get("tokenization", {})
    available = token_info.get("availableCredits", 0.0)
    retired = token_info.get("retiredCredits", 0.0)
    payload_str = json.dumps(project_dict)

    cursor.execute("""
        INSERT INTO projects (id, name, payload, available_credits, retired_credits, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            payload=excluded.payload,
            available_credits=excluded.available_credits,
            retired_credits=excluded.retired_credits,
            updated_at=CURRENT_TIMESTAMP
    """, (project_id, name, payload_str, available, retired))

    conn.commit()
    conn.close()

def get_all_retirements() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT payload FROM retirements ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [json.loads(row["payload"]) for row in rows]

def save_retirement(record_dict: Dict[str, Any]):
    conn = get_connection()
    cursor = conn.cursor()

    rec_id = record_dict["id"]
    project_id = record_dict["projectId"]
    company_name = record_dict.get("companyName", "Anonymous")
    tons = record_dict.get("tonsRetired", 0.0)
    payload_str = json.dumps(record_dict)

    cursor.execute("""
        INSERT INTO retirements (id, project_id, company_name, tons_retired, payload, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            payload=excluded.payload,
            created_at=CURRENT_TIMESTAMP
    """, (rec_id, project_id, company_name, tons, payload_str))

    conn.commit()
    conn.close()

def get_retirement_by_certificate_id(certificate_id: str) -> Optional[Dict[str, Any]]:
    if not certificate_id or not certificate_id.strip():
        return None
    clean_id = certificate_id.strip().upper()
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT payload FROM retirements WHERE UPPER(json_extract(payload, '$.certificateId')) = ?", (clean_id,))
        row = cursor.fetchone()
        if row:
            conn.close()
            return json.loads(row["payload"])
    except Exception:
        pass

    cursor.execute("SELECT payload FROM retirements ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    for r in rows:
        try:
            data = json.loads(r["payload"])
            if (data.get("certificateId") or "").strip().upper() == clean_id:
                return data
            if (data.get("id") or "").strip().upper() == clean_id:
                return data
        except Exception:
            continue

    # Fallback to in-memory default retirements if somehow not in DB yet
    for default_rec in DEFAULT_RETIREMENTS:
        if (default_rec.get("certificateId") or "").strip().upper() == clean_id or (default_rec.get("id") or "").strip().upper() == clean_id:
            try:
                save_retirement(default_rec)
            except Exception:
                pass
            return default_rec

    return None
