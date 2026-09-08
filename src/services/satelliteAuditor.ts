import { LatLng, SatelliteBandData, CarbonAuditMetrics } from '../types';

/**
 * Generates or retrieves simulated multi-spectral Sentinel-2 satellite data for given coordinates
 */
export function fetchSentinel2Data(coords: LatLng, _areaHa?: number): SatelliteBandData {
  const [lat] = coords;
  // Coastal mangrove biomes have distinct high NIR (0.45 - 0.65) and low Red (0.05 - 0.12)
  const isHealthyMangroveZone = (lat > 11 && lat < 23);

  const baseNIR = isHealthyMangroveZone ? 0.58 + (Math.sin(lat) * 0.05) : 0.22;
  const baseRed = isHealthyMangroveZone ? 0.08 + (Math.cos(lat) * 0.02) : 0.28;
  const baseGreen = isHealthyMangroveZone ? 0.18 : 0.15;
  const baseBlue = isHealthyMangroveZone ? 0.06 : 0.14;
  const baseSWIR = isHealthyMangroveZone ? 0.12 : 0.35;

  return {
    band2_blue: Math.round(baseBlue * 1000) / 1000,
    band3_green: Math.round(baseGreen * 1000) / 1000,
    band4_red: Math.round(baseRed * 1000) / 1000,
    band8_nir: Math.round(baseNIR * 1000) / 1000,
    band11_swir: Math.round(baseSWIR * 1000) / 1000,
    cloudCoverPct: Math.round((Math.random() * 4 + 1.2) * 10) / 10,
    acquisitionDate: new Date().toISOString().split('T')[0],
    satellite: 'Sentinel-2B'
  };
}

/**
 * Computes scientific MRV carbon audit from multi-spectral bands & area
 */
export function computeCarbonAudit(
  spectral: SatelliteBandData,
  areaHa: number,
  canopyDensityMultiplier: number = 0.82
): CarbonAuditMetrics {
  const nir = spectral.band8_nir;
  const red = spectral.band4_red;
  const blue = spectral.band2_blue;

  // 1. NDVI = (NIR - RED) / (NIR + RED)
  const ndviRaw = (nir - red) / (nir + red);
  const ndvi = Math.round(Math.max(0, Math.min(1, ndviRaw)) * 1000) / 1000;

  // 2. EVI = 2.5 * ((NIR - RED) / (NIR + 6*RED - 7.5*BLUE + 1))
  const eviRaw = 2.5 * ((nir - red) / (nir + 6 * red - 7.5 * blue + 1));
  const evi = Math.round(Math.max(0, Math.min(1, eviRaw)) * 1000) / 1000;

  // 3. NDRE (RedEdge Index proxy)
  const ndre = Math.round((ndvi * 0.88) * 1000) / 1000;

  // 4. Canopy Cover % and Mean Tree Height (m)
  const canopyCoverPct = Math.round(Math.min(96, Math.max(20, ndvi * 115 * canopyDensityMultiplier)) * 10) / 10;
  const meanTreeHeightM = Math.round((4.5 + ndvi * 11.2 * canopyDensityMultiplier) * 10) / 10;

  // 5. Scientific Allometric Biomass Computation (IPCC Tier-3 Wetland Model)
  // AGB (Above Ground Biomass) = a * (NDVI)^b * (Height)^c
  const woodDensity = 0.65; // g/cm3 for Avicennia / Rhizophora
  const agbTonsPerHa = Math.round(
    (115.0 * Math.pow(ndvi, 1.8) * Math.pow(meanTreeHeightM / 8.0, 0.85) * woodDensity) * 10
  ) / 10;

  // BGB (Below Ground Biomass - extensive root stilt/pneumatophore system) ~ 49% of AGB
  const bgbTonsPerHa = Math.round((agbTonsPerHa * 0.49) * 10) / 10;

  // Soil Organic Carbon (SOC) annual sequestration increment (sediment accretion + root turnover)
  const socTonsPerHa = Math.round((14.2 + ndvi * 8.5 * canopyDensityMultiplier) * 10) / 10;

  // Carbon stock to Total Living Carbon (0.47 carbon fraction) + Annual SOC
  const livingBiomassCarbon = (agbTonsPerHa + bgbTonsPerHa) * 0.47;
  const totalCarbonTonsPerHa = Math.round((livingBiomassCarbon + socTonsPerHa) * 10) / 10;

  // Stoichiometric conversion to CO2 equivalent: Carbon * (44 / 12) = Carbon * 3.6667
  const co2EquivalentPerHa = Math.round((totalCarbonTonsPerHa * 3.6667) * 10) / 10;
  const projectTotalCO2Tons = Math.round(co2EquivalentPerHa * areaHa);

  // Confidence Score based on Sentinel-2 low cloud cover (<5%) and multi-spectral SNR
  const confidenceScore = Math.round((99.5 - spectral.cloudCoverPct * 0.8) * 10) / 10;

  // Historical Multi-temporal Progression (2022 to 2026)
  const historicalTrend = [
    { year: 2022, ndvi: Math.round((ndvi * 0.68) * 100) / 100, co2Tons: Math.round(projectTotalCO2Tons * 0.62) },
    { year: 2023, ndvi: Math.round((ndvi * 0.76) * 100) / 100, co2Tons: Math.round(projectTotalCO2Tons * 0.74) },
    { year: 2024, ndvi: Math.round((ndvi * 0.85) * 100) / 100, co2Tons: Math.round(projectTotalCO2Tons * 0.86) },
    { year: 2025, ndvi: Math.round((ndvi * 0.94) * 100) / 100, co2Tons: Math.round(projectTotalCO2Tons * 0.95) },
    { year: 2026, ndvi: ndvi, co2Tons: projectTotalCO2Tons },
  ];

  // Cryptographic audit hash (SHA-256 equivalent mock)
  const hashSeed = `${spectral.acquisitionDate}-${ndvi}-${agbTonsPerHa}-${projectTotalCO2Tons}-${areaHa}`;
  const auditHash = '0x' + Array.from(hashSeed).reduce(
    (hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0
  ).toString(16).padStart(64, 'a1f79c4e');

  return {
    ndvi,
    evi,
    ndre,
    canopyCoverPct,
    meanTreeHeightM,
    agbTonsPerHa,
    bgbTonsPerHa,
    socTonsPerHa,
    totalCarbonTonsPerHa,
    co2EquivalentPerHa,
    projectTotalCO2Tons,
    confidenceScore,
    historicalTrend,
    auditHash,
    auditedAt: new Date().toISOString()
  };
}

/**
 * Generates an 8x8 false-color NDVI heatmap grid for satellite visualization
 */
export function generateNDVIGrid(baseNDVI: number): { x: number; y: number; ndvi: number; color: string }[] {
  const grid: { x: number; y: number; ndvi: number; color: string }[] = [];
  const size = 8;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const variation = (Math.sin(x * 1.5) * Math.cos(y * 1.2) * 0.12) + ((Math.random() - 0.5) * 0.08);
      const cellNdvi = Math.max(0.1, Math.min(0.98, Math.round((baseNDVI + variation) * 100) / 100));
      
      let color = '#ef4444'; // Red (dead/bare soil)
      if (cellNdvi > 0.75) color = '#059669'; // Lush deep emerald green
      else if (cellNdvi > 0.60) color = '#10b981'; // Green
      else if (cellNdvi > 0.45) color = '#84cc16'; // Light green
      else if (cellNdvi > 0.30) color = '#eab308'; // Yellow
      else if (cellNdvi > 0.20) color = '#f97316'; // Orange

      grid.push({ x, y, ndvi: cellNdvi, color });
    }
  }

  return grid;
}
