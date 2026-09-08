import sqlite3
import json
import os
from typing import List, Optional, Dict, Any

DB_PATH = os.environ.get("AEGISBLUE_DB_PATH", "aegisblue.db")

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

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
