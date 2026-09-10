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

class CcnCoreSampleInfo(BaseModel):
    coreId: str
    stationName: str
    region: str
    distanceKm: float
    samplingDepthCm: float
    soilCarbonStock_tC_ha: float
    dominantSpecies: str
    institution: str
    doi: str
    referenceDataset: str = "Smithsonian Coastal Carbon Network (CCN v2.1)"

class BoundaryCheckResult(BaseModel):
    isValid: bool
    overlapPercentage: float
    matchedGmwZone: Optional[MangrovePolygon] = None
    nearestCcnCore: Optional[CcnCoreSampleInfo] = None
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
    sceneId: Optional[str] = None
    platform: Optional[str] = "Sentinel-2B"
    sunElevation: Optional[float] = None
    thumbnailUrl: Optional[str] = None
    telemetryMode: str = "LIVE_SENTINEL_STAC"

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
    boundingBox: Optional[BoundingBox] = None

class SatelliteAuditResponse(BaseModel):
    spectralData: SatelliteBandData
    carbonMetrics: CarbonAuditMetrics
    heatmapGrid: List[NDVIHeatmapCell]
    nearestCcnCore: Optional[CcnCoreSampleInfo] = None

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
    tokenId: Optional[str] = None
    contractAddress: Optional[str] = "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9"
    network: Optional[str] = "Polygon Amoy"

class CertificateVerificationResponse(BaseModel):
    status: str
    certificateId: str
    record: RetirementRecord
    isBlockchainVerified: bool
    network: str = "Polygon Amoy"
    contractAddress: str = "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9"
    explorerUrl: Optional[str] = None
    verifiedAt: str

class RetirementRequest(BaseModel):
    projectId: str
    tonsToRetire: float
    companyName: str
    companyWallet: str
    purpose: str
    tokenId: Optional[str] = None
    transactionHash: Optional[str] = None
    blockNumber: Optional[int] = None
    retiredAt: Optional[str] = None
    certificateId: Optional[str] = None
    ipfsCertificateCid: Optional[str] = None


class AuditDossierPinRequest(BaseModel):
    projectId: str
    auditHash: str
    totalCredits: float
    projectName: Optional[str] = "Blue Carbon Restoration Project"
    ngoName: Optional[str] = None
    locationName: Optional[str] = None
    areaHectares: Optional[float] = None
    coordinates: Optional[List[List[float]]] = None
    spectralData: Optional[SatelliteBandData] = None
    carbonMetrics: Optional[CarbonAuditMetrics] = None
    nearestCcnCore: Optional[CcnCoreSampleInfo] = None
    dossier: Optional[Dict[str, Any]] = None
    customMetadata: Optional[Dict[str, Any]] = None

class AuditDossierPinResponse(BaseModel):
    status: str = "SUCCESS"
    cid: str
    gatewayUrl: str
    pinSize: int
    timestamp: str
    projectId: str
    auditHash: str
    totalCredits: float
    dossier: Dict[str, Any]

