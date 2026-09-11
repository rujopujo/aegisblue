export interface CarbonProject {
  id: string;
  name: string;
  code: string;
  region: string;
  state: string;
  country: string;
  ecosystemType: 'Mangrove' | 'Tidal Wetland' | 'Seagrass Meadow' | 'Salt Marsh';
  hectares: number;
  totalTons: number;
  availableTons: number;
  pricePerTon: number; // in USD
  ndviScore: number; // 0.0 to 1.0 (from Member 2 Satellite MRV)
  soilOrganicCarbon: number; // g/cm3 (from CCN_depthseries.csv)
  auditScore: number; // out of 100
  auditFingerprint: string;
  ipfsDossierCid: string;
  polygonTokenId: string;
  polygonContractAddress: string;
  mintTxHash: string;
  imageUrl: string;
  description: string;
  sequestrationRate?: number; // tCO2e / ha / yr
  registryStandard: string; // e.g. 'SIH BlueCarbon Verra-Aligned'
  sdgGoals: number[];
}

export interface OffsetOrder {
  orderId: string;
  projectId: string;
  projectName: string;
  buyerCompany: string;
  signatoryName: string;
  corporateEmail: string;
  tonsRetired: number;
  pricePerTon: number;
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  esgPurpose: string;
  retirementDate: string;
  polygonBurnTxHash: string;
  certificateId: string;
  status: 'PENDING' | 'BURNING' | 'CONFIRMED' | 'FAILED';
}

export interface ESGCertificateData {
  certificateId: string;
  orderId: string;
  companyName: string;
  authorizedSignatory: string;
  corporateEmail: string;
  tonsRetired: number;
  projectName: string;
  projectRegion: string;
  ecosystemType: string;
  polygonBurnTxHash: string;
  polygonTokenId: string;
  ipfsDossierCid: string;
  issuanceDate: string;
  verificationUrl: string;
  qrCodeDataUrl?: string;
  environmentalImpact: {
    treesEquivalent: number;
    flightMilesOffset: number;
    carsOffRoadDays: number;
  };
}
