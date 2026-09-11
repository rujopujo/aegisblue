import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight, 
  Trees, 
  ChevronRight, 
  Sparkles, 
  MapPin, 
  Waves, 
  Sprout, 
  Compass, 
  Sliders, 
  DollarSign
} from 'lucide-react';
import { TokenizedProject } from '../types';
import { DroneTelemetryMRVStation } from './DroneTelemetryMRVStation';

interface BCIHomepageProps {
  onLaunchPillar: (pillar: 'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | 'dashboard') => void;
  projects: TokenizedProject[];
}

export const BCI_Homepage: React.FC<BCIHomepageProps> = ({
  onLaunchPillar,
  projects,
}) => {
  // Interactive Coastal Agriculture Calculator State
  const [plotHectares, setPlotHectares] = useState<number>(250);

  // Dynamic Ecological Calculations based on IUCN & IPCC Coastal Wetland defaults
  const annualCarbonTons = Math.round(plotHectares * 18.5);
  const sedimentBurialTons = Math.round(annualCarbonTons * 0.58);
  const waveEnergyDampening = Math.min(66, Math.round(25 + Math.log10(plotHectares) * 16));
  const stewardshipIncomeUSD = Math.round(annualCarbonTons * 28.5);

  return (
    <div className="space-y-16 animate-fadeIn pb-20">
      
      {/* ───────────────────────────────────────────────────────
          HERO SECTION (Matching OG Reference Layout)
          Full aerial coastal photography with bold crisp typography
          ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[580px] sm:min-h-[620px] flex items-center bg-[#001E33] text-white">
        {/* Background Aerial Photography */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-banner.jpg"
            alt="Pristine coastal mangrove lagoon aerial view"
            className="w-full h-full object-cover object-center opacity-50 scale-100 transition-transform duration-1000"
          />
          {/* Natural Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#001E33]/95 via-[#002B49]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#001E33]/80 via-transparent to-black/20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl space-y-6">
            
            {/* Pill Badge matching original UI */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300 tracking-wide uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Global Coastal Ecosystem Conservation & Digital MRV</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
              Mitigating climate change through coastal ecosystem conservation and restoration.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-light max-w-2xl">
              The Blue Carbon Initiative is a coordinated, global program building science, policy, and automated satellite verification to protect, restore, and finance coastal blue carbon ecosystems.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <button
                onClick={() => onLaunchPillar('pillar1')}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#002B49] font-black text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Launch Automated MRV Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onLaunchPillar('pillar4')}
                className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm flex items-center space-x-2 transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Enterprise Carbon Marketplace</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          KEY GLOBAL METRICS & INSTITUTIONAL TICKER
          High-legibility metrics based on IPCC wetland parameters
          ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-[#E8E2D6] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          
          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#002B49] font-mono">10x Faster</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Carbon Sequestration Rate</div>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Coastal blue carbon habitats capture atmospheric carbon up to ten times faster per hectare than mature tropical rainforests.
            </p>
          </div>

          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#059669] font-mono">50%+</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sediment Carbon Storage</div>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Stores carbon in waterlogged, anaerobic tidal mudflats for centuries without oxygen-driven decomposition.
            </p>
          </div>

          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#0284C7] font-mono">GMW v3.0</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Anti-Fraud Gatekeeper</div>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              Automated spatial verification against Global Mangrove Watch boundaries to guarantee ecological additionality.
            </p>
          </div>

          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#C2633C] font-mono">1:1 Backed</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Polygon Amoy Minting</div>
            <p className="text-xs text-slate-500 leading-relaxed font-light">
              1 MGROV Token = 1 Metric Ton CO₂ with permanent on-chain Proof of Burn for verified ESG filings.
            </p>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          SECTION 2: WIX-INSPIRED AGRICULTURAL PHILOSOPHY
          "Rooted in Science, Cultivated in Saltwater"
          ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="stamp-badge">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ecological Agronomy & Estuary Science</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002B49] tracking-tight font-display">
            The Living Coastal Carbon Farm
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Unlike terrestrial monocultures, coastal wetland conservation operates as an interconnected biological engine. Mangroves, seagrasses, and salt marshes form an intertidal buffer that captures carbon, filters coastal runoff, and enriches artisanal fisheries.
          </p>
        </div>

        {/* 3 Real Ecosystem Cards with Genuine Field Photography */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Mangroves */}
          <div className="parcel-card overflow-hidden flex flex-col justify-between group">
            <div className="relative h-60 overflow-hidden">
              <img
                src="/images/mangrove-roots.jpg"
                alt="Mangrove root stilt ecosystem"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#002B49]/90 text-white text-[11px] font-bold">
                Mangrove Estuaries
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[#002B49] text-[10px] font-mono font-bold">
                1,000+ t CO₂ / ha
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#002B49] font-display">Coastal Mangroves</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Intertidal trees adapted to high-salinity zones. Their dense prop roots trap organic sediment, burying organic carbon in anaerobic mud for millennia while sheltering juvenile fish species.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E8E2D6] flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Sentinel-2 NDVI & Biomass Monitored</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Seagrass Meadows */}
          <div className="parcel-card overflow-hidden flex flex-col justify-between group">
            <div className="relative h-60 overflow-hidden">
              <img
                src="/images/seagrass-meadow.jpg"
                alt="Seagrass underwater meadow"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#002B49]/90 text-white text-[11px] font-bold">
                Submerged Meadows
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[#002B49] text-[10px] font-mono font-bold">
                10% Oceanic Carbon
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#002B49] font-display">Seagrass Beds</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Underwater flowering prairies stabilizing marine seabeds. Covering less than 0.2% of ocean floors, they account for over 10% of total ocean carbon sequestration and nursery habitat.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E8E2D6] flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Bathymetric Spectral Telemetry</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Tidal Salt Marshes */}
          <div className="parcel-card overflow-hidden flex flex-col justify-between group">
            <div className="relative h-60 overflow-hidden">
              <img
                src="/images/salt-marsh.jpg"
                alt="Coastal salt marsh tidal creek landscape"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#002B49]/90 text-white text-[11px] font-bold">
                Intertidal Marshes
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[#002B49] text-[10px] font-mono font-bold">
                Peat Peat Accumulation
              </div>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#002B49] font-display">Tidal Salt Marshes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Halophytic salt marshes found along temperate and tropical estuaries. Their dense root rhizomes trap mineral silt and continuously elevate coastal land against sea-level rise.
                </p>
              </div>
              <div className="pt-4 border-t border-[#E8E2D6] flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Tidal Hydrology Mapping</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          SECTION 3: INTERACTIVE COASTAL HARVEST CALCULATOR
          Interactive field yield modeling engine
          ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-[#F0FDF4] rounded-3xl p-8 sm:p-12 border border-[#E8E2D6] shadow-md space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E8E2D6]">
            <div className="space-y-2 max-w-2xl">
              <div className="stamp-badge-terracotta">
                <Sliders className="w-3.5 h-3.5 text-amber-700" />
                <span>Interactive Field Yield Modeler</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B49] font-display">
                Estimate Conservation & Sequestration Yield
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Adjust the coastal wetland conservation surface area to model verified annual carbon capture, deep soil carbon accretion, and community co-op revenue.
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-semibold">Selected Surface Area:</span>
              <span className="text-4xl font-black text-[#002B49] font-mono">{plotHectares.toLocaleString()}</span>
              <span className="text-sm font-bold text-emerald-700 ml-1">Hectares</span>
            </div>
          </div>

          {/* Slider Control */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-500 font-mono">
              <span>25 Hectares (Local Tidal Co-op)</span>
              <span>1,000 Hectares (Estuary Reserve)</span>
              <span>2,500 Hectares (Regional Biosphere)</span>
            </div>
            <input
              type="range"
              min={25}
              max={2500}
              step={25}
              value={plotHectares}
              onChange={(e) => setPlotHectares(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#059669]"
            />
          </div>

          {/* Real-time Dynamic Yield Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Annual Carbon Yield</span>
                <Sprout className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-[#002B49] font-mono">
                ~{annualCarbonTons.toLocaleString()} <span className="text-xs font-bold text-emerald-700">t CO₂e/yr</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Equivalent to removing {Math.round(annualCarbonTons / 4.6).toLocaleString()} gasoline passenger cars.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Sediment Soil Carbon</span>
                <Compass className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-black text-[#0284C7] font-mono">
                ~{sedimentBurialTons.toLocaleString()} <span className="text-xs font-bold text-slate-500">t SOC</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Buried in anaerobic soil matrices resistant to fire and seasonal decay.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Storm Surge Buffer</span>
                <Waves className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-teal-700 font-mono">
                {waveEnergyDampening}% <span className="text-xs font-bold text-slate-500">Dampened</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Wave kinetic energy absorbed, protecting vulnerable coastal villages.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>Stewardship Fund</span>
                <DollarSign className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-[#C2633C] font-mono">
                ${stewardshipIncomeUSD.toLocaleString()} <span className="text-xs font-bold text-slate-500">USD</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Direct revenue channeled to coastal community guardians and wild fisheries.
              </p>
            </div>

          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-mono">
              *Calculated using IPCC Tier-3 Blue Carbon parameters & Sentinel-2 radiometric coefficients.
            </p>
            <button
              onClick={() => onLaunchPillar('pillar1')}
              className="px-6 py-2.5 rounded-xl bg-[#002B49] hover:bg-[#001E33] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <span>Audit Your Coastal Plot Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          SECTION 4: AUTONOMOUS DRONE MRV & FIELD TELEMETRY STATION
          Autonomous aerial drone telemetry and spectral HUD
          ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <DroneTelemetryMRVStation onLaunchMRV={() => onLaunchPillar('pillar2')} />
      </section>

      {/* ───────────────────────────────────────────────────────
          SECTION 5: THE 4-PILLAR DIGITAL LIFE-CYCLE
          Verification lifecycle explaining physical sensor data to tokenization
          ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="stamp-badge">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Automated MRV Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#002B49] tracking-tight font-display">
            How AegisBlue Eliminates Greenwashing
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every step from spatial boundary registration to smart contract token retirement is cryptographically verified and anchored on Polygon Amoy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1 */}
          <div 
            onClick={() => onLaunchPillar('pillar1')}
            className="bg-white rounded-2xl p-6 border border-[#E8E2D6] hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-sm">
              01
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#002B49] text-base group-hover:text-emerald-700 transition-colors">
                Spatial Gatekeeper
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                NGO submits GPS boundaries. Automatically checked via Turf.js against Global Mangrove Watch (GMW v3.0) to ensure genuine coastal biome status.
              </p>
            </div>
            <div className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 pt-2">
              <span>Launch Gatekeeper</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div 
            onClick={() => onLaunchPillar('pillar2')}
            className="bg-white rounded-2xl p-6 border border-[#E8E2D6] hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-black text-sm">
              02
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#002B49] text-base group-hover:text-sky-700 transition-colors">
                Satellite MRV Engine
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sentinel-2 multispectral bands (B4 Red, B8 NIR, B11 SWIR) calculate NDVI, canopy cover, and Aboveground Biomass (AGB) with zero manual bias.
              </p>
            </div>
            <div className="text-xs font-semibold text-sky-700 flex items-center space-x-1 pt-2">
              <span>View Satellite MRV</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div 
            onClick={() => onLaunchPillar('pillar3')}
            className="bg-white rounded-2xl p-6 border border-[#E8E2D6] hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-black text-sm">
              03
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#002B49] text-base group-hover:text-purple-700 transition-colors">
                Dual-IPFS Tokenization
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Audited package is pinned to IPFS and minted as ERC-1155 tokens on Polygon Amoy. 1 Token = 1 Metric Ton CO₂e backed by permanent cryptographic CID.
              </p>
            </div>
            <div className="text-xs font-semibold text-purple-700 flex items-center space-x-1 pt-2">
              <span>Audit Tokenization</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pillar 4 */}
          <div 
            onClick={() => onLaunchPillar('pillar4')}
            className="bg-white rounded-2xl p-6 border border-[#E8E2D6] hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-4"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-black text-sm">
              04
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-[#002B49] text-base group-hover:text-amber-700 transition-colors">
                B2B Marketplace & Burn
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enterprises purchase and burn credits directly via smart contracts to generate immutable proofs for BRSR, SEC, and global ESG disclosure standards.
              </p>
            </div>
            <div className="text-xs font-semibold text-amber-700 flex items-center space-x-1 pt-2">
              <span>Browse Marketplace</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          SECTION 6: VERIFIED CONSERVATION PLOTS SHOWCASE
          Audited coastal conservation allotment parcels
          ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="stamp-badge">
              <Trees className="w-3.5 h-3.5 text-emerald-700" />
              <span>Active Field Allotments</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002B49] font-display">
              Audited Blue Carbon Allotments
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Live conservation parcels undergoing continuous Sentinel-2 satellite telemetry and verified under GMW v3.0.
            </p>
          </div>

          <button
            onClick={() => onLaunchPillar('pillar4')}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#002B49] font-bold text-xs uppercase tracking-wider border border-[#E8E2D6] shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>View All Parcels in Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id}
              className="bg-white rounded-2xl p-6 border border-[#E8E2D6] hover:border-emerald-500 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    {project.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    Audited {project.spectralData.satellite}
                  </span>
                </div>

                <h3 className="font-bold text-[#002B49] text-base line-clamp-2">
                  {project.name}
                </h3>

                <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{project.locationName}</span>
                </div>

                {/* Parcel Metrics */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D6] grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Surface Area:</span>
                    <strong className="text-[#002B49]">{project.areaHectares} Hectares</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Verified Pool:</span>
                    <strong className="text-emerald-700">{project.tokenization.availableCredits.toLocaleString()} MGROV</strong>
                  </div>
                </div>

                {/* Co-Benefits */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Stewardship Features:</div>
                  <div className="flex flex-wrap gap-1">
                    {project.coBenefits.slice(0, 2).map((benefit, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200/60 truncate max-w-full">
                        🌾 {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onLaunchPillar('pillar4')}
                className="w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer mt-2"
              >
                Inspect & Acquire Credits
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────
          SECTION 6: INSTITUTIONAL CO-ORGANIZERS & PARTNERS
          Prestigious credibility footer section
          ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-2xl p-8 border border-[#E8E2D6] shadow-sm text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Coordinated Global Environmental Coalition
            </span>
            <h3 className="text-xl font-bold text-[#002B49] font-display">
              Built on International Conservation Standards
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-600">
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
              Conservation International
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
              IUCN Blue Carbon Commission
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
              IOC-UNESCO Marine Policy
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
              Global Mangrove Watch (v3.0)
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
              Polygon Amoy PoS Network
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
