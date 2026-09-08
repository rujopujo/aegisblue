import {
  LatLng,
  SatelliteBandData,
  CarbonAuditMetrics,
  IPFSMetaPayload,
  TokenizedProject,
  RetirementRecord,
} from '../types';

export const POLYGON_AMOY_CONFIG = {
  chainId: 80002,
  networkName: 'Polygon Amoy Testnet',
  rpcUrl: 'https://rpc-amoy.polygon.technology',
  currencySymbol: 'POL',
  blockExplorer: 'https://amoy.polygonscan.com',
  contractAddress: '0x89D2B6a7C1885f8f8b0e8b3b7A3E620B3454b52C',
  standard: 'ERC-1155 (Fractionalized Blue Carbon Credit Protocol)',
};

/**
 * Creates deterministic pseudo-IPFS CID (v1 bafy...) from object content
 */
export function generateIPFSCID(data: unknown): string {
  const jsonString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `bafybeih${hex}7z9w2qm4k8n2v9d1x5l0p4w8q2m9b7c1`;
}

/**
 * Generates deterministic Web3 Transaction Hash
 */
export function generateTxHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, 'e7b1a9');
  return `0x${hex}98f2c3a71b402e8d91c53b2a704e6f1a8c3d7e5b2901a`;
}

/**
 * Bundles project coordinates, Sentinel-2 spectral data, and MRV math into IPFS package
 */
export function createIPFSPackage(
  projectId: string,
  projectName: string,
  ngoName: string,
  coordinates: LatLng[],
  areaHectares: number,
  gmwZoneId: string,
  spectral: SatelliteBandData,
  audit: CarbonAuditMetrics
): IPFSMetaPayload {
  const metadata = {
    projectId,
    projectName,
    ngoName,
    coordinates,
    areaHectares,
    gmwZoneId,
    spectralData: spectral,
    carbonAudit: audit,
    scientificModel: 'IPCC Wetlands Supplement (2013) & Komiyama Allometric Canopy Math',
    allometricEquation: 'AGB = 115.0 * (NDVI)^1.8 * (H/8.0)^0.85 * 0.65; BGB = 0.49 * AGB',
    stoichiometricRatio: 'CO2e = Total Organic Carbon * (44/12)',
    auditSignature: audit.auditHash,
  };

  const cid = generateIPFSCID(metadata);

  return {
    cid,
    gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
    payloadSizeKb: Math.round((JSON.stringify(metadata).length / 1024) * 10) / 10,
    pinnedAt: new Date().toISOString(),
    metadata,
  };
}

/**
 * Mints ERC-1155 fractionalized carbon credits on Polygon Amoy
 */
export function mintCarbonTokens(
  projectData: {
    id: string;
    name: string;
    ngoName: string;
    ngoWallet?: string;
    ngoRegistrationNo?: string;
    locationName: string;
    coordinates: LatLng[];
    areaHectares: number;
    boundaryResult: any;
    spectralData: SatelliteBandData;
    carbonMetrics: CarbonAuditMetrics;
    ipfs: IPFSMetaPayload;
    pricePerTonUSD?: number;
    coBenefits?: string[];
  }
): TokenizedProject {
  const totalTons = projectData.carbonMetrics.projectTotalCO2Tons;
  const tokenId = `MGROV-${projectData.id.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  const txHash = generateTxHash(`${projectData.id}-${totalTons}-${projectData.ipfs.cid}`);
  const blockNumber = 14892000 + Math.floor(Math.random() * 50000);

  return {
    id: projectData.id,
    name: projectData.name,
    ngoName: projectData.ngoName,
    ngoWallet: projectData.ngoWallet || '0x71C...9E34',
    ngoRegistrationNo: projectData.ngoRegistrationNo || 'NGO/WB/2021/88492',
    locationName: projectData.locationName,
    coordinates: projectData.coordinates,
    areaHectares: projectData.areaHectares,
    boundaryResult: projectData.boundaryResult,
    spectralData: projectData.spectralData,
    carbonMetrics: projectData.carbonMetrics,
    ipfs: projectData.ipfs,
    tokenization: {
      tokenId,
      contractAddress: POLYGON_AMOY_CONFIG.contractAddress,
      network: POLYGON_AMOY_CONFIG.networkName,
      totalMinted: totalTons,
      availableCredits: totalTons,
      retiredCredits: 0,
      pricePerTonUSD: projectData.pricePerTonUSD || 28.5,
      txHash,
      blockNumber,
      mintedAt: new Date().toISOString(),
    },
    coBenefits: projectData.coBenefits || [
      'Biodiversity & Bengal Tiger Habitat Protection',
      'Coastal Storm Surge & Cyclone Resilience',
      'Empowerment of 1,200+ Coastal Fisherwomen',
      'Marine Nursery for Mud Crabs & Estuarine Fish',
    ],
    status: 'LISTED',
  };
}

/**
 * Simulates on-chain Credit Retirement (Burning) on Polygon Amoy
 */
export function executeTokenRetirement(
  project: TokenizedProject,
  tonsToRetire: number,
  companyName: string,
  companyWallet: string,
  purpose: string
): { updatedProject: TokenizedProject; retirementRecord: RetirementRecord } {
  if (tonsToRetire > project.tokenization.availableCredits) {
    throw new Error('Retirement exceeds available carbon credits in pool.');
  }

  const burnTxHash = generateTxHash(`BURN-${project.id}-${companyName}-${tonsToRetire}-${Date.now()}`);
  const certificateId = `ESG-NETZERO-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;
  const burnBlock = project.tokenization.blockNumber + Math.floor(Math.random() * 2000) + 10;

  const retirementRecord: RetirementRecord = {
    id: `RET-${Date.now().toString().slice(-6)}`,
    projectId: project.id,
    projectName: project.name,
    companyName,
    companyWallet,
    tonsRetired: tonsToRetire,
    purpose,
    vintageYear: 2026,
    txHash: burnTxHash,
    burnReceiptBlock: burnBlock,
    retiredAt: new Date().toISOString(),
    certificateId,
    ipfsCertificateCid: `bafybeig${Math.random().toString(36).slice(2, 10)}burncert77x1`,
  };

  const updatedProject: TokenizedProject = {
    ...project,
    tokenization: {
      ...project.tokenization,
      availableCredits: project.tokenization.availableCredits - tonsToRetire,
      retiredCredits: project.tokenization.retiredCredits + tonsToRetire,
    },
  };

  return { updatedProject, retirementRecord };
}
