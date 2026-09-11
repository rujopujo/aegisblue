import { MangrovePolygon, PresetLocation } from '../types';

/**
 * Official Global Mangrove Watch (GMW v3.0) Reference Polygons & Coastal Datasets
 */
export const GMW_MANGROVE_ZONES: MangrovePolygon[] = [
  {
    id: 'GMW-IND-SUN-001',
    name: 'Sundarbans Biosphere Mangrove Reserve',
    region: 'West Bengal & Delta',
    country: 'India',
    coordinates: [
      [21.80, 88.50],
      [21.80, 89.15],
      [22.20, 89.15],
      [22.25, 88.90],
      [22.15, 88.55],
      [21.95, 88.40],
      [21.80, 88.50],
    ],
    mangroveSpecies: ['Rhizophora mangle', 'Avicennia marina', 'Sonneratia apetala', 'Heritiera fomes (Sundari)'],
    canopyDensityAvg: 0.82,
    averageSoilCarbon: 285.5, // t C/ha
    areaHectares: 426000,
    description: 'The largest contiguous mangrove forest on Earth, UNESCO World Heritage site and high-density blue carbon sink.'
  },
  {
    id: 'GMW-IND-PIC-002',
    name: 'Pichavaram Mangrove Estuarine Ecosystem',
    region: 'Tamil Nadu (Cuddalore)',
    country: 'India',
    coordinates: [
      [11.40, 79.76],
      [11.40, 79.82],
      [11.47, 79.82],
      [11.48, 79.77],
      [11.44, 79.75],
      [11.40, 79.76],
    ],
    mangroveSpecies: ['Avicennia marina', 'Rhizophora apiculata', 'Bruguiera cylindrica'],
    canopyDensityAvg: 0.74,
    averageSoilCarbon: 240.2,
    areaHectares: 1100,
    description: 'One of the largest mangrove forests in South India, with complex network of 4,400 large and small canals.'
  },
  {
    id: 'GMW-IND-BHI-003',
    name: 'Bhitarkanika Ramsar Mangrove Delta',
    region: 'Odisha (Kendrapara)',
    country: 'India',
    coordinates: [
      [20.65, 86.80],
      [20.65, 87.05],
      [20.85, 87.05],
      [20.85, 86.82],
      [20.72, 86.78],
      [20.65, 86.80],
    ],
    mangroveSpecies: ['Rhizophora mucronata', 'Avicennia officinalis', 'Excoecaria agallocha'],
    canopyDensityAvg: 0.79,
    averageSoilCarbon: 260.8,
    areaHectares: 67200,
    description: 'Second largest mangrove ecosystem in India after Sundarbans, high biodiversity and massive blue carbon density.'
  },
  {
    id: 'GMW-IND-COR-004',
    name: 'Coringa Mangrove Wildlife Sanctuary',
    region: 'Andhra Pradesh (Godavari Delta)',
    country: 'India',
    coordinates: [
      [16.75, 82.20],
      [16.75, 82.35],
      [16.95, 82.35],
      [16.95, 82.22],
      [16.85, 82.18],
      [16.75, 82.20],
    ],
    mangroveSpecies: ['Avicennia marina', 'Avicennia alba', 'Rhizophora mucronata'],
    canopyDensityAvg: 0.71,
    averageSoilCarbon: 220.0,
    areaHectares: 23500,
    description: 'Vibrant Godavari estuary mangrove belt protecting the coast from cyclone storm surges.'
  },
  {
    id: 'GMW-IND-AND-005',
    name: 'Baratang & Havelock Island Mangrove Creek',
    region: 'Andaman & Nicobar Islands',
    country: 'India',
    coordinates: [
      [12.10, 92.70],
      [12.10, 92.88],
      [12.32, 92.88],
      [12.32, 92.72],
      [12.20, 92.68],
      [12.10, 92.70],
    ],
    mangroveSpecies: ['Rhizophora stylosa', 'Ceriops tagal', 'Lumnitzera littorea'],
    canopyDensityAvg: 0.88,
    averageSoilCarbon: 310.4,
    areaHectares: 18400,
    description: 'Pristine deep-root island mangrove biome with some of the highest per-hectare carbon sequestration in Asia.'
  },
  {
    id: 'GMW-IND-KUT-006',
    name: 'Gulf of Kutch Marine National Park Mangroves',
    region: 'Gujarat (Jamnagar/Dwarka)',
    country: 'India',
    coordinates: [
      [22.40, 69.30],
      [22.40, 69.95],
      [22.80, 69.95],
      [22.80, 69.35],
      [22.55, 69.25],
      [22.40, 69.30],
    ],
    mangroveSpecies: ['Avicennia marina (Salt tolerant dwarf variety)'],
    canopyDensityAvg: 0.65,
    averageSoilCarbon: 195.0,
    areaHectares: 45000,
    description: 'Arid climate mangrove adaptation in the intertidal zone of Gulf of Kutch.'
  }
];

/**
 * Interactive Presets to test Boundary Check Gatekeeper (Valid vs Fraudulent Locations)
 */
export const PRESET_LOCATIONS: PresetLocation[] = [
  {
    id: 'PRESET-SUN-01',
    name: 'Sundarbans Coastal Delta (Lothian Island)',
    type: 'mangrove',
    coordinates: [21.90, 88.75],
    polygon: [
      [21.88, 88.73],
      [21.88, 88.78],
      [21.93, 88.78],
      [21.93, 88.73],
      [21.88, 88.73]
    ],
    region: 'West Bengal',
    description: 'Pristine mangrove wetland with high Rhizophora density inside GMW official polygon.',
    expectedResult: 'APPROVED'
  },
  {
    id: 'PRESET-PIC-02',
    name: 'Pichavaram Mangrove Lagoon Block',
    type: 'mangrove',
    coordinates: [11.43, 79.78],
    polygon: [
      [11.42, 79.77],
      [11.42, 79.80],
      [11.45, 79.80],
      [11.45, 79.77],
      [11.42, 79.77]
    ],
    region: 'Tamil Nadu',
    description: 'Verified coastal estuarine wetland with high blue carbon density.',
    expectedResult: 'APPROVED'
  },
  {
    id: 'PRESET-BHI-03',
    name: 'Bhitarkanika Gahirmatha Buffer Zone',
    type: 'mangrove',
    coordinates: [20.73, 86.92],
    polygon: [
      [20.70, 86.89],
      [20.70, 86.95],
      [20.76, 86.95],
      [20.76, 86.89],
      [20.70, 86.89]
    ],
    region: 'Odisha',
    description: 'Dense mangrove estuary with massive organic sediment carbon accumulation.',
    expectedResult: 'APPROVED'
  },
  {
    id: 'PRESET-FRAUD-MUM',
    name: 'Mumbai Nariman Point / BKC Skyscraper Hub',
    type: 'urban',
    coordinates: [18.92, 72.82],
    polygon: [
      [18.91, 72.81],
      [18.91, 72.84],
      [18.94, 72.84],
      [18.94, 72.81],
      [18.91, 72.81]
    ],
    region: 'Maharashtra (Urban)',
    description: 'High-density financial district with commercial skyscrapers. Zero coastal mangrove habitat.',
    expectedResult: 'REJECTED',
    rejectionReason: 'FRAUD_DETECTED: Spatial coordinates fall in high-density commercial/urban fabric. 0.0% overlap with Global Mangrove Watch dataset. Land cover is classified as Urban Built-up (impermeable concrete).'
  },
  {
    id: 'PRESET-FRAUD-DESERT',
    name: 'Thar Desert Sand Dunes (Jaisalmer)',
    type: 'desert',
    coordinates: [26.91, 70.90],
    polygon: [
      [26.89, 70.88],
      [26.89, 70.93],
      [26.94, 70.93],
      [26.94, 70.88],
      [26.89, 70.88]
    ],
    region: 'Rajasthan (Arid Desert)',
    description: 'Arid desert sand dunes over 600km away from any coastal or saline marine habitat.',
    expectedResult: 'REJECTED',
    rejectionReason: 'FRAUD_DETECTED: Coordinates located in Arid Inland Desert biome (Thar Basin). Zero coastal proximity, zero saline wetland indicators. Instant gatekeeper rejection.'
  },
  {
    id: 'PRESET-FRAUD-BLR',
    name: 'Bangalore Electronic City Tech Park',
    type: 'urban',
    coordinates: [12.84, 77.66],
    polygon: [
      [12.83, 77.65],
      [12.83, 77.68],
      [12.86, 77.68],
      [12.86, 77.65],
      [12.83, 77.65]
    ],
    region: 'Karnataka (Inland City)',
    description: 'IT Tech park located on Deccan Plateau at 900m above sea level.',
    expectedResult: 'REJECTED',
    rejectionReason: 'FRAUD_DETECTED: Non-coastal highland (900m elevation). No mangrove ecological conditions possible. Rejected by GMW Gatekeeper.'
  }
];
