export type LatLng = [number, number];

export interface MangrovePolygon {
  id: string;
  name: string;
  region: string;
  country: string;
  coordinates: LatLng[];
  mangroveSpecies: string[];
  canopyDensityAvg: number; // 0 - 1.0
  averageSoilCarbon: number; // tons CO2/ha
  areaHectares: number;
  description: string;
}

export interface PresetLocation {
  id: string;
  name: string;
  type: 'mangrove' | 'urban' | 'desert' | 'water';
  coordinates: LatLng;
  polygon: LatLng[];
  region: string;
  description: string;
  expectedResult: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface CcnCoreSampleInfo {
  coreId: string;
  stationName: string;
  region: string;
  distanceKm: number;
  samplingDepthCm: number;
  soilCarbonStock_tC_ha: number;
  dominantSpecies: string;
  institution: string;
  doi: string;
  referenceDataset?: string;
}

export interface BoundaryCheckResult {
  isValid: boolean;
  overlapPercentage: number;
  matchedGmwZone?: MangrovePolygon;
  nearestCcnCore?: CcnCoreSampleInfo;
  totalAreaHa: number;
  warnings: string[];
  rejectionReason?: string;
  spatialConfidence: number;
  timestamp: string;
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export interface SatelliteBandData {
  band2_blue: number;   // 490 nm
  band3_green: number;  // 560 nm
  band4_red: number;    // 665 nm
  band8_nir: number;    // 842 nm
  band11_swir: number;  // 1610 nm
  cloudCoverPct: number;
  acquisitionDate: string;
  satellite: string;
  sceneId?: string;
  platform?: string;
  sunElevation?: number;
  thumbnailUrl?: string;
  telemetryMode?: 'LIVE_SENTINEL_STAC' | 'CALIBRATED_SIMULATION';
}

export interface CarbonAuditMetrics {
  ndvi: number;               // Normalized Difference Veg Index: (NIR - Red) / (NIR + Red)
  evi: number;                // Enhanced Veg Index
  ndre: number;               // RedEdge Index for chlorophyl
  canopyCoverPct: number;     // %
  meanTreeHeightM: number;    // meters
  agbTonsPerHa: number;       // Above-Ground Biomass
  bgbTonsPerHa: number;       // Below-Ground Biomass (Rhizophora roots)
  socTonsPerHa: number;       // Soil Organic Carbon (30-100cm core)
  totalCarbonTonsPerHa: number;
  co2EquivalentPerHa: number; // Total Carbon * 3.667
  projectTotalCO2Tons: number;// co2EquivalentPerHa * areaHa
  confidenceScore: number;    // %
  historicalTrend: { year: number; ndvi: number; co2Tons: number }[];
  auditHash: string;
  auditedAt: string;
}

export interface IPFSMetaPayload {
  cid: string;
  gatewayUrl: string;
  payloadSizeKb: number;
  pinnedAt: string;
  metadata: {
    projectId: string;
    projectName: string;
    ngoName: string;
    coordinates: LatLng[];
    areaHectares: number;
    gmwZoneId: string;
    spectralData: SatelliteBandData;
    carbonAudit: CarbonAuditMetrics;
    scientificModel: string;
    allometricEquation: string;
    stoichiometricRatio: string;
    auditSignature: string;
  };
}

export interface TokenizedProject {
  id: string;
  name: string;
  ngoName: string;
  ngoWallet: string;
  ngoRegistrationNo: string;
  locationName: string;
  coordinates: LatLng[];
  areaHectares: number;
  boundaryResult: BoundaryCheckResult;
  spectralData: SatelliteBandData;
  carbonMetrics: CarbonAuditMetrics;
  ipfs: IPFSMetaPayload;
  tokenization: {
    tokenId: string;
    contractAddress: string;
    network: string;
    totalMinted: number;
    availableCredits: number;
    retiredCredits: number;
    pricePerTonUSD: number;
    txHash: string;
    blockNumber: number;
    mintedAt: string;
  };
  coBenefits: string[];
  status: 'PENDING_AUDIT' | 'AUDITED' | 'TOKENIZED' | 'LISTED';
}

export interface RetirementRecord {
  id: string;
  projectId: string;
  projectName: string;
  companyName: string;
  companyWallet: string;
  tonsRetired: number;
  purpose: string;
  vintageYear: number;
  txHash: string;
  burnReceiptBlock: number;
  retiredAt: string;
  certificateId: string;
  ipfsCertificateCid: string;
}
