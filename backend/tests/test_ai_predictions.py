import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_sam_canopy_refinement_success():
    """Validates that SAM canopy snapping refines coordinates into accurate mangrove canopy vertices."""
    # Sunderbans mangrove rough polygon (4 points)
    rough_coords = [
        [21.88, 88.73],
        [21.88, 88.78],
        [21.93, 88.78],
        [21.93, 88.73]
    ]
    response = client.post("/api/spatial/sam-refine", json={
        "coordinates": rough_coords,
        "zoomLevel": 14
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["originalVertices"] == 4
    assert data["refinedVertices"] >= 12
    assert len(data["snappedCoordinates"]) == data["refinedVertices"]
    assert data["canopyConfidence"] >= 90.0
    assert data["areaHectares"] > 0
    assert data["vegetationDensity"] > 0.70
    assert "Segment Anything Model" in data["method"]

def test_sam_canopy_refinement_insufficient_points():
    """Rejects coordinate lists with fewer than 3 vertices."""
    response = client.post("/api/spatial/sam-refine", json={
        "coordinates": [[21.88, 88.73], [21.88, 88.78]]
    })
    assert response.status_code == 400
    assert "At least 3 polygon boundary coordinates" in response.json()["detail"]

def test_predictive_infographics_success():
    """Tests 3D carbon partitioning, equivalency impact, and species recommender endpoints."""
    response = client.post("/api/ai/predictive-infographics", json={
        "latitude": 21.90,
        "longitude": 88.75,
        "areaHectares": 250.0,
        "totalCO2Tons": 37500.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    
    # 3D Carbon Partitioning
    part = data["partitioning"]
    assert part["aboveGroundPct"] == 27.5
    assert part["belowGroundPct"] == 14.2
    assert part["soilOrganicPct"] == 58.3
    assert len(part["depthTiers"]) == 4
    
    # Equivalency impact metrics
    eq = data["equivalencies"]
    assert eq["carsRemovedPerYear"] > 5000
    assert eq["passengerFlightsAvoided"] > 10000
    assert eq["homesCleanPoweredYear"] > 4000
    assert eq["stormSurgeWaveReductionMeters"] >= 1.0

    # Species recommendations
    species = data["speciesRecommendations"]
    assert len(species) == 3
    total_pct = sum(s["recommendedRatioPct"] for s in species)
    assert total_pct == 100

    # Yield & diversity metrics
    assert data["baselineYieldTonsPerYear"] > 0
    assert data["projected10YearYieldTons"] > 0
    assert data["shannonBiodiversityIndex"] > 0
