import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Cpu, 
  Layers, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Hash, 
  Sparkles, 
  Leaf, 
  BarChart, 
  Binary 
} from 'lucide-react';
import { 
  LatLng, 
  SatelliteBandData, 
  CarbonAuditMetrics, 
  BoundaryCheckResult 
} from '../types';
import { 
  fetchSentinel2Data, 
  computeCarbonAudit, 
  generateNDVIGrid 
} from '../services/satelliteAuditor';

interface Pillar2AuditingProps {
  projectData: {
    name: string;
    ngoName: string;
    ngoWallet: string;
    ngoRegistrationNo: string;
    locationName: string;
    coordinates: LatLng[];
    areaHectares: number;
    boundaryResult: BoundaryCheckResult;
  };
  onAuditCompleted: (auditData: {
    spectralData: SatelliteBandData;
    carbonMetrics: CarbonAuditMetrics;
  }) => void;
}

export const Pillar2_Auditing: React.FC<Pillar2AuditingProps> = ({
  projectData,
  onAuditCompleted,
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [spectralData, setSpectralData] = useState<SatelliteBandData | null>(null);
  const [carbonMetrics, setCarbonMetrics] = useState<CarbonAuditMetrics | null>(null);
  const [ndviGrid, setNdviGrid] = useState<{ x: number; y: number; ndvi: number; color: string }[]>([]);

  // Trigger Satellite MRV Processing Pipeline
  const runSatelliteAuditPipeline = () => {
    setIsScanning(true);
    setScanStep(1); // Fetching Sentinel-2 Multi-Spectral Bands
    setCarbonMetrics(null);

    setTimeout(() => {
      setScanStep(2); // Computing Band 8 (NIR) & Band 4 (Red) NDVI Index
      const spectral = fetchSentinel2Data(projectData.coordinates[0], projectData.areaHectares);
      setSpectralData(spectral);
    }, 900);

    setTimeout(() => {
      setScanStep(3); // Running Allometric Carbon Sequestration Equations (AGB + BGB + SOC)
    }, 1800);

    setTimeout(() => {
      const spectral = spectralData || fetchSentinel2Data(projectData.coordinates[0], projectData.areaHectares);
      const audit = computeCarbonAudit(spectral, projectData.areaHectares);
      setCarbonMetrics(audit);
      setNdviGrid(generateNDVIGrid(audit.ndvi));
      setScanStep(4); // Audit Completed & Tamper-proof Hash Generated
      setIsScanning(false);
    }, 2800);
  };

  useEffect(() => {
    runSatelliteAuditPipeline();
  }, [projectData]);

  const handleProceedToTokenization = () => {
    if (!spectralData || !carbonMetrics) return;
    onAuditCompleted({ spectralData, carbonMetrics });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pillar 2 Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#083344] border border-cyan-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold">
            <Satellite className="w-4 h-4" />
            <span>Pillar 2: Automated Scientific Auditing (The "M" and "R" in MRV)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Sentinel-2 Satellite Telemetry & Carbon Sequestration Engine
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate human auditor corruption, delays, and bias. Mathematical algorithms ingest multi-spectral satellite reflectance data, calculate canopy NDVI vegetation indices, and execute peer-reviewed allometric biomass equations to derive the <strong className="text-cyan-400">exact metric tons of CO₂ sequestered</strong>.
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 hidden md:block pointer-events-none">
          <Binary className="w-64 h-64 text-cyan-400" />
        </div>
      </div>

      {/* Project Target Context Strip */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">{projectData.name}</div>
            <div className="text-slate-400 font-mono text-[11px]">
              Location: {projectData.locationName} | NGO: {projectData.ngoName}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right font-mono">
            <div className="text-slate-400 text-[10px]">Verified Area:</div>
            <div className="text-emerald-400 font-bold text-sm">{projectData.areaHectares} Hectares</div>
          </div>
          <button
            onClick={runSatelliteAuditPipeline}
            disabled={isScanning}
            className="px-3.5 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-700 border border-ocean-700 text-xs font-mono text-cyan-300 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Re-fetch Satellite Pass</span>
          </button>
        </div>
      </div>

      {/* Step-by-Step Satellite Pipeline Tracker */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Automated MRV Pipeline Execution Flow</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Step 1 */}
          <div className={`p-4 rounded-xl border transition-all ${
            scanStep >= 1 ? 'bg-ocean-900 border-cyan-500/50 shadow-md shadow-cyan-500/10' : 'bg-ocean-950/60 border-ocean-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-slate-400">STAGE 01</span>
              {scanStep > 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : scanStep === 1 ? (
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : null}
            </div>
            <div className="font-bold text-slate-200">Sentinel-2 Multi-Spectral Ingestion</div>
            <div className="text-[11px] text-slate-400 mt-1">Band 4 (Red) & Band 8 (NIR) at 10m spatial resolution.</div>
          </div>

          {/* Step 2 */}
          <div className={`p-4 rounded-xl border transition-all ${
            scanStep >= 2 ? 'bg-ocean-900 border-cyan-500/50 shadow-md shadow-cyan-500/10' : 'bg-ocean-950/60 border-ocean-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-slate-400">STAGE 02</span>
              {scanStep > 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : scanStep === 2 ? (
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : null}
            </div>
            <div className="font-bold text-slate-200">NDVI & Canopy Cover Indexing</div>
            <div className="text-[11px] text-slate-400 mt-1">Normalized vegetative reflectance: (NIR - Red) / (NIR + Red).</div>
          </div>

          {/* Step 3 */}
          <div className={`p-4 rounded-xl border transition-all ${
            scanStep >= 3 ? 'bg-ocean-900 border-cyan-500/50 shadow-md shadow-cyan-500/10' : 'bg-ocean-950/60 border-ocean-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-slate-400">STAGE 03</span>
              {scanStep > 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : scanStep === 3 ? (
                <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
              ) : null}
            </div>
            <div className="font-bold text-slate-200">Allometric Biomass Math</div>
            <div className="text-[11px] text-slate-400 mt-1">IPCC Wetlands Model: AGB + BGB + Soil Carbon Stock to CO₂e.</div>
          </div>

          {/* Step 4 */}
          <div className={`p-4 rounded-xl border transition-all ${
            scanStep >= 4 ? 'bg-ocean-900 border-emerald-500/50 shadow-md shadow-emerald-500/10' : 'bg-ocean-950/60 border-ocean-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] text-slate-400">STAGE 04</span>
              {scanStep >= 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : null}
            </div>
            <div className="font-bold text-slate-200">Cryptographic Audit Seal</div>
            <div className="text-[11px] text-slate-400 mt-1">Mathematical proof hashed with zero human manipulation.</div>
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      {carbonMetrics && spectralData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Spectral Bands & Scientific Equations */}
          <div className="lg:col-span-6 space-y-6">
            {/* Spectral Reflectance Cards */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Satellite className="w-4 h-4 text-cyan-400" />
                  <span>Sentinel-2 Spectral Reflectance Bands</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Cloud Cover: {spectralData.cloudCoverPct}%</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800">
                  <div className="text-[10px] text-slate-400">Band 4 (Red)</div>
                  <div className="text-red-400 font-bold text-base mt-0.5">{spectralData.band4_red}</div>
                  <div className="text-[9px] text-slate-500">665 nm</div>
                </div>
                <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800">
                  <div className="text-[10px] text-slate-400">Band 8 (NIR)</div>
                  <div className="text-emerald-400 font-bold text-base mt-0.5">{spectralData.band8_nir}</div>
                  <div className="text-[9px] text-slate-500">842 nm</div>
                </div>
                <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800">
                  <div className="text-[10px] text-slate-400">Band 2 (Blue)</div>
                  <div className="text-blue-400 font-bold text-base mt-0.5">{spectralData.band2_blue}</div>
                  <div className="text-[9px] text-slate-500">490 nm</div>
                </div>
                <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800">
                  <div className="text-[10px] text-slate-400">Band 11 (SWIR)</div>
                  <div className="text-yellow-400 font-bold text-base mt-0.5">{spectralData.band11_swir}</div>
                  <div className="text-[9px] text-slate-500">1610 nm</div>
                </div>
              </div>

              {/* Derived Indices */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-gradient-to-br from-emerald-950/60 to-ocean-950 p-3.5 rounded-xl border border-emerald-500/30 text-center">
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">NDVI INDEX</div>
                  <div className="text-2xl font-black text-emerald-300 font-mono mt-1">{carbonMetrics.ndvi}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High Canopy Health</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-950/60 to-ocean-950 p-3.5 rounded-xl border border-cyan-500/30 text-center">
                  <div className="text-[10px] font-mono text-cyan-400 font-semibold">EVI INDEX</div>
                  <div className="text-2xl font-black text-cyan-300 font-mono mt-1">{carbonMetrics.evi}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Atmosphere Corrected</div>
                </div>
                <div className="bg-gradient-to-br from-teal-950/60 to-ocean-950 p-3.5 rounded-xl border border-teal-500/30 text-center">
                  <div className="text-[10px] font-mono text-teal-400 font-semibold">CANOPY COVER</div>
                  <div className="text-2xl font-black text-teal-300 font-mono mt-1">{carbonMetrics.canopyCoverPct}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Mean H: {carbonMetrics.meanTreeHeightM}m</div>
                </div>
              </div>
            </div>

            {/* Scientific Allometric Model Breakdown */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <BarChart className="w-4 h-4 text-emerald-400" />
                <span>Peer-Reviewed Carbon Allometry Formula Breakdown</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="bg-ocean-950/90 p-3.5 rounded-xl border border-ocean-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">1. Above-Ground Biomass (AGB):</span>
                    <span className="font-mono text-emerald-400 font-bold">{carbonMetrics.agbTonsPerHa} t / ha</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Formula: AGB = 115.0 × (NDVI)<sup>1.8</sup> × (Height/8.0)<sup>0.85</sup> × ρ<sub>wood</sub>
                  </div>
                </div>

                <div className="bg-ocean-950/90 p-3.5 rounded-xl border border-ocean-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">2. Below-Ground Root Biomass (BGB):</span>
                    <span className="font-mono text-emerald-400 font-bold">{carbonMetrics.bgbTonsPerHa} t / ha</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Formula: BGB = 0.49 × AGB (Rhizophora prop root & pneumatophore density)
                  </div>
                </div>

                <div className="bg-ocean-950/90 p-3.5 rounded-xl border border-ocean-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">3. Soil Organic Carbon (SOC Core):</span>
                    <span className="font-mono text-emerald-400 font-bold">{carbonMetrics.socTonsPerHa} t / ha</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Tidal sediment carbon accretion (top 100cm anaerobic blue carbon mud)
                  </div>
                </div>

                <div className="bg-ocean-950/90 p-3.5 rounded-xl border border-ocean-800 space-y-2">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="font-medium">4. Total Organic Carbon (TOC):</span>
                    <span className="font-mono text-emerald-400 font-bold">{carbonMetrics.totalCarbonTonsPerHa} t C / ha</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Formula: TOC = ((AGB + BGB) × 0.47 C-fraction) + SOC
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 p-3.5 rounded-xl border border-emerald-500/40 space-y-1">
                  <div className="flex justify-between items-center text-slate-100">
                    <span className="font-bold">5. Stoichiometric CO₂ Equivalent:</span>
                    <span className="font-mono text-cyan-300 font-bold text-sm">
                      {carbonMetrics.co2EquivalentPerHa} t CO₂e / ha
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Conversion: C × (44 / 12) = Total Organic Carbon × 3.6667
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Total Metric Tons Sequestered & False-Color Pixel Heatmap */}
          <div className="lg:col-span-6 space-y-6">
            {/* Total Metric Tons Result Box (The Golden Number) */}
            <div className="glass-panel-glow p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">
                    Automated Carbon Sequestration Computation
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold">
                  Zero Human Bias
                </span>
              </div>

              <div className="bg-ocean-950/90 p-5 rounded-2xl border border-ocean-800 text-center space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Total Irreversible Carbon Sequestered
                </div>
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-mono">
                  {carbonMetrics.projectTotalCO2Tons.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  METRIC TONS OF CO₂ EQUIVALENT
                </div>
                <div className="text-[11px] text-slate-400 pt-2 border-t border-ocean-850 flex items-center justify-center space-x-4">
                  <span>Area: <strong className="text-white">{projectData.areaHectares} ha</strong></span>
                  <span>Density: <strong className="text-white">{carbonMetrics.co2EquivalentPerHa} t/ha</strong></span>
                  <span>Confidence: <strong className="text-emerald-400">{carbonMetrics.confidenceScore}%</strong></span>
                </div>
              </div>

              {/* Cryptographic Hash Seal */}
              <div className="bg-ocean-950/80 p-3.5 rounded-xl border border-ocean-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                  <span className="flex items-center space-x-1.5">
                    <Hash className="w-4 h-4 text-cyan-400" />
                    <span>Unalterable MRV Audit Hash:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">SHA-256 Verified</span>
                </div>
                <div className="font-mono text-[10px] text-cyan-300 break-all bg-black/40 p-2 rounded border border-cyan-900/50">
                  {carbonMetrics.auditHash}
                </div>
              </div>

              {/* Action Button: Proceed to Web3 Tokenization */}
              <button
                onClick={handleProceedToTokenization}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-ocean-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all duration-200"
              >
                <span>Proceed to Pillar 3: Web3 Tokenization (IPFS + Smart Contract)</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* False Color Pixel Heatmap & Multi-year Trends */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Sentinel-2 False-Color NDVI Heatmap Grid</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">8x8 Super-Sampled Array</span>
              </div>

              <div className="grid grid-cols-8 gap-1.5 p-3 bg-ocean-950 rounded-xl border border-ocean-800">
                {ndviGrid.map((cell, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-md flex items-center justify-center text-[9px] font-mono font-bold text-black transition-transform hover:scale-125 hover:z-10 shadow-sm cursor-pointer"
                    style={{ backgroundColor: cell.color }}
                    title={`Grid (${cell.x}, ${cell.y}) - NDVI: ${cell.ndvi}`}
                  >
                    {cell.ndvi.toFixed(2)}
                  </div>
                ))}
              </div>

              {/* Historical Trend Timeline */}
              <div className="space-y-2 pt-2 border-t border-ocean-800">
                <div className="text-xs font-bold text-slate-300">Historical Sequestration Progression (2022 - 2026):</div>
                <div className="grid grid-cols-5 gap-2 font-mono text-center text-xs">
                  {carbonMetrics.historicalTrend.map((trend) => (
                    <div key={trend.year} className="bg-ocean-950/80 p-2 rounded-lg border border-ocean-800">
                      <div className="text-[10px] text-slate-400">{trend.year}</div>
                      <div className="text-cyan-400 font-bold text-xs mt-0.5">{trend.ndvi}</div>
                      <div className="text-[9px] text-emerald-400">{trend.co2Tons.toLocaleString()} t</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
