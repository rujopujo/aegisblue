import { TokenizedProject, RetirementRecord } from '../types';
import { GMW_MANGROVE_ZONES } from './gmwBoundaries';
import { computeCarbonAudit, fetchSentinel2Data } from '../services/satelliteAuditor';
import { createIPFSPackage, mintCarbonTokens } from '../services/web3Registry';
import { validateBoundaryAgainstGMW } from '../services/spatialValidator';

export function initializeMockProjects(): TokenizedProject[] {
  // Project 1: Sundarbans Delta Restoration
  const sunCoords: [number, number][] = [
    [21.88, 88.73],
    [21.88, 88.78],
    [21.93, 88.78],
    [21.93, 88.73],
    [21.88, 88.73],
  ];
  const sunSpectral = fetchSentinel2Data(sunCoords[0], 450);
  const sunAudit = computeCarbonAudit(sunSpectral, 450, 0.88);
  const sunBoundary = validateBoundaryAgainstGMW(sunCoords);
  const sunIpfs = createIPFSPackage(
    'PROJ-SUN-2026-01',
    'Sundarbans Core Tiger Reserve Blue Carbon Restoration',
    'Sundarbans Mangrove Climate Alliance (SMCA)',
    sunCoords,
    450,
    GMW_MANGROVE_ZONES[0].id,
    sunSpectral,
    sunAudit
  );

  const proj1 = mintCarbonTokens({
    id: 'PROJ-SUN-2026-01',
    name: 'Sundarbans Core Tiger Reserve Blue Carbon Restoration',
    ngoName: 'Sundarbans Mangrove Climate Alliance (SMCA)',
    ngoWallet: '0x3B88e63F9D661d9a244C3A73Ec5D875F7925e510',
    ngoRegistrationNo: 'WB-NGO-ENV-2021-9941',
    locationName: 'Sundarbans Biosphere Reserve, West Bengal',
    coordinates: sunCoords,
    areaHectares: 450,
    boundaryResult: sunBoundary,
    spectralData: sunSpectral,
    carbonMetrics: sunAudit,
    ipfs: sunIpfs,
    pricePerTonUSD: 32.0,
    coBenefits: [
      'Royal Bengal Tiger & Fishing Cat Habitat Refuge',
      'Cyclone Storm-Surge Buffer for 180,000 Island Inhabitants',
      'Sustainable Honey & Wild Fishery Co-op Livelihoods',
      'Tidal Mudflat Sediment Accretion Monitoring'
    ]
  });

  // Project 2: Pichavaram Estuarine Rhizophora Expansion
  const picCoords: [number, number][] = [
    [11.42, 79.77],
    [11.42, 79.80],
    [11.45, 79.80],
    [11.45, 79.77],
    [11.42, 79.77],
  ];
  const picSpectral = fetchSentinel2Data(picCoords[0], 180);
  const picAudit = computeCarbonAudit(picSpectral, 180, 0.82);
  const picBoundary = validateBoundaryAgainstGMW(picCoords);
  const picIpfs = createIPFSPackage(
    'AEGIS-PICHAVARAMESTUAR-180',
    'Pichavaram Estuarine Rhizophora Expansion',
    'Tamil Nadu Coastal Ecology Foundation',
    picCoords,
    180,
    GMW_MANGROVE_ZONES[1].id,
    picSpectral,
    picAudit
  );
  picIpfs.cid = 'bafkreid3n64zywg4nud5z3oq2vla5fuiwa75pszuxpv7mjx4w3cxs5ezzq';
  picIpfs.gatewayUrl = 'https://gateway.pinata.cloud/ipfs/bafkreid3n64zywg4nud5z3oq2vla5fuiwa75pszuxpv7mjx4w3cxs5ezzq';

  const proj2 = mintCarbonTokens({
    id: 'AEGIS-PICHAVARAMESTUAR-180',
    name: 'Pichavaram Estuarine Rhizophora Expansion',
    ngoName: 'Tamil Nadu Coastal Ecology Foundation',
    ngoWallet: '0x5f05Afd47769c5d5e332b026D33883a004C2cc68',
    ngoRegistrationNo: 'TN-COAST-SOC-2019-4412',
    locationName: 'Pichavaram Mangrove Wetlands, Cuddalore, TN',
    coordinates: picCoords,
    areaHectares: 180,
    boundaryResult: picBoundary,
    spectralData: picSpectral,
    carbonMetrics: picAudit,
    ipfs: picIpfs,
    pricePerTonUSD: 29.5,
    coBenefits: [
      'Prop-Root Habitat for Penaeid Prawns & Estuarine Fish',
      'Tsunami & Wave Dissipation Coastal Barrier',
      'Community Nursery & Eco-Tourism Stewardship'
    ]
  });

  // Reference the verified on-chain Polygon Amoy ERC-1155 token
  proj2.tokenization.tokenId = '7300511014531487208209184491691875089324748676569431105539752191596868391902';
  proj2.tokenization.totalMinted = 100;
  proj2.tokenization.availableCredits = 100;
  proj2.tokenization.txHash = '0x5deb7af620ac53bad6fa6d9acb611605f7cab71ce1bb74b830de71b698c0217d';
  proj2.tokenization.registrationTxHash = '0xb2942f936e9920acab30dea9f5bba856067e85949017fbb736b8662f605f1b90';
  proj2.tokenization.blockNumber = 47242269;


  // Project 3: Bhitarkanika Delta Blue Carbon Project
  const bhiCoords: [number, number][] = [
    [20.70, 86.89],
    [20.70, 86.95],
    [20.76, 86.95],
    [20.76, 86.89],
    [20.70, 86.89],
  ];
  const bhiSpectral = fetchSentinel2Data(bhiCoords[0], 310);
  const bhiAudit = computeCarbonAudit(bhiSpectral, 310, 0.85);
  const bhiBoundary = validateBoundaryAgainstGMW(bhiCoords);
  const bhiIpfs = createIPFSPackage(
    'PROJ-BHI-2026-03',
    'Bhitarkanika Gahirmatha Tidal Carbon Sanctuary',
    'Odisha Wetland Conservation Trust',
    bhiCoords,
    310,
    GMW_MANGROVE_ZONES[2].id,
    bhiSpectral,
    bhiAudit
  );

  const proj3 = mintCarbonTokens({
    id: 'PROJ-BHI-2026-03',
    name: 'Bhitarkanika Gahirmatha Tidal Carbon Sanctuary',
    ngoName: 'Odisha Wetland Conservation Trust',
    ngoWallet: '0x5F19Ac92f6b57912E6B47C5E981e4b9f2913f019',
    ngoRegistrationNo: 'OD-ENV-TR-2020-1092',
    locationName: 'Bhitarkanika National Park, Odisha',
    coordinates: bhiCoords,
    areaHectares: 310,
    boundaryResult: bhiBoundary,
    spectralData: bhiSpectral,
    carbonMetrics: bhiAudit,
    ipfs: bhiIpfs,
    pricePerTonUSD: 31.0,
    coBenefits: [
      'Olive Ridley Turtle Nesting Beach Buffer',
      'Saltwater Crocodile Ecological Nursery',
      'Deep Subtidal Organic Carbon Accretion'
    ]
  });

  return [proj1, proj2, proj3];
}

export const INITIAL_RETIREMENTS: RetirementRecord[] = [
  {
    id: 'RET-884910',
    projectId: 'PROJ-SUN-2026-01',
    projectName: 'Sundarbans Core Tiger Reserve Blue Carbon Restoration',
    companyName: 'Infosys ESG & Green Data Hubs',
    companyWallet: '0x992451FaE6a5B49d88c42b109D4EaB7f02d4D14E',
    tonsRetired: 1250,
    purpose: 'Scope 1 & 2 Neutralization for Bangalore Data Centers (Q1 2026)',
    vintageYear: 2026,
    txHash: '0x94f1c79a83b2e5917a4c6012e8b093fa71b29a01f5c381792d4b8e21a0f918e2',
    burnReceiptBlock: 14892410,
    retiredAt: '2026-08-20T10:14:00Z',
    certificateId: 'ESG-NETZERO-INF992-2026',
    ipfsCertificateCid: 'bafybeih442x9k2v7burninf992m8a1b5c2',
    tokenId: '7300511014531487208209184491691875089324748676569431105539752191596868391901',
    contractAddress: '0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9',
    network: 'Polygon Amoy',
  },
  {
    id: 'RET-884911',
    projectId: 'AEGIS-PICHAVARAMESTUAR-180',
    projectName: 'Pichavaram Estuarine Rhizophora Expansion',
    companyName: 'Tata Motors Green Mobility Wing',
    companyWallet: '0x43B215E9110778B5ca65C87c53dF92aB171888FA',
    tonsRetired: 800,
    purpose: 'Zero Emission EV Supply Chain Decarbonization Offset',
    vintageYear: 2026,
    txHash: '0x12c8a93e507b9148d2f1094ba72c019485b31f79c2a8e410b981f4a9238c11e4',
    burnReceiptBlock: 14892550,
    retiredAt: '2026-08-24T14:30:00Z',
    certificateId: 'ESG-NETZERO-TAT43B-2026',
    ipfsCertificateCid: 'bafybeic771v8m3w4burntat43bm1x9c3d4',
    tokenId: '7300511014531487208209184491691875089324748676569431105539752191596868391902',
    contractAddress: '0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9',
    network: 'Polygon Amoy',
  },
];
