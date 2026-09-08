from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class BoundingBox(BaseModel):
    minLat: float
    maxLat: float
    minLng: float
    maxLng: float

class MangrovePolygon(BaseModel):
    id: str
    name: str
    region: str
    country: str
    coordinates: List[List[float]]
    mangroveSpecies: List[str]
    canopyDensityAvg: float
    averageSoilCarbon: float
    areaHectares: float
    description: str

class BoundaryCheckResult(BaseModel):
    isValid: bool
    overlapPercentage: float
    matchedGmwZone: Optional[MangrovePolygon] = None
    totalAreaHa: float
    warnings: List[str] = []
    rejectionReason: Optional[str] = None
    spatialConfidence: float
    timestamp: str
    boundingBox: BoundingBox

class BoundaryCheckRequest(BaseModel):
    coordinates: List[List[float]]

class SatelliteBandData(BaseModel):
    band2_blue: float
    band3_green: float
    band4_red: float
    band8_nir: float
    band11_swir: float
    cloudCoverPct: float
    acquisitionDate: str
    satellite: str = "Sentinel-2B"

class HistoricalTrendPoint(BaseModel):
    year: int
    ndvi: float
    co2Tons: float

class CarbonAuditMetrics(BaseModel):
    ndvi: float
    evi: float
    ndre: float
    canopyCoverPct: float
    meanTreeHeightM: float
    agbTonsPerHa: float
    bgbTonsPerHa: float
    socTonsPerHa: float
    totalCarbonTonsPerHa: float
    co2EquivalentPerHa: float
    projectTotalCO2Tons: float
    confidenceScore: float
    historicalTrend: List[HistoricalTrendPoint]
    auditHash: str
    auditedAt: str

class NDVIHeatmapCell(BaseModel):
    x: int
    y: int
    ndvi: float
    color: str

class SatelliteAuditRequest(BaseModel):
    coordinates: List[float]  # [lat, lng]
    areaHa: float = 120.5
    canopyDensityMultiplier: float = 0.82

class SatelliteAuditResponse(BaseModel):
    spectralData: SatelliteBandData
    carbonMetrics: CarbonAuditMetrics
    heatmapGrid: List[NDVIHeatmapCell]

class IPFSMetaPayload(BaseModel):
    cid: str
    gatewayUrl: str
    payloadSizeKb: float
    pinnedAt: str
    metadata: Dict[str, Any]

class TokenizationInfo(BaseModel):
    tokenId: str
    contractAddress: str
    network: str
    totalMinted: float
    availableCredits: float
    retiredCredits: float
    pricePerTonUSD: float
    txHash: str
    blockNumber: int
    mintedAt: str

class TokenizedProject(BaseModel):
    id: str
    name: str
    ngoName: str
    ngoWallet: str
    ngoRegistrationNo: str
    locationName: str
    coordinates: List[List[float]]
    areaHectares: float
    boundaryResult: BoundaryCheckResult
    spectralData: SatelliteBandData
    carbonMetrics: CarbonAuditMetrics
    ipfs: IPFSMetaPayload
    tokenization: TokenizationInfo
    coBenefits: List[str] = []
    status: str = "LISTED"

class RetirementRecord(BaseModel):
    id: str
    projectId: str
    projectName: str
    companyName: str
    companyWallet: str
    tonsRetired: float
    purpose: str
    vintageYear: int
    txHash: str
    burnReceiptBlock: int
    retiredAt: str
    certificateId: str
    ipfsCertificateCid: str

class RetirementRequest(BaseModel):
    projectId: str
    tonsToRetire: float
    companyName: str
    companyWallet: str
    purpose: str
