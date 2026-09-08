import React from 'react';
import { 
  ShieldCheck, 
  Satellite, 
  Coins, 
  ShoppingBag, 
  ArrowRight, 
  Layers, 
  FileText, 
  Trees, 
  ChevronRight,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { TokenizedProject } from '../types';

interface BCIHomepageProps {
  onLaunchPillar: (pillar: 'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | 'dashboard') => void;
  projects: TokenizedProject[];
}

export const BCI_Homepage: React.FC<BCIHomepageProps> = ({
  onLaunchPillar,
  projects,
}) => {
  return (
    <div className="space-y-16 animate-fadeIn pb-16">
      {/* Hero Banner Section (Clean, prestigious, full-width photography) */}
      <section className="relative overflow-hidden min-h-[560px] flex items-center bg-[#001E33] text-white">
        {/* Background Image with Clean Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-banner.jpg"
            alt="Pristine coastal mangrove forest aerial view"
            className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001E33]/95 via-[#002B49]/80 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300 tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Global Coastal Ecosystem Conservation & Digital MRV</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Mitigating climate change through coastal ecosystem conservation and restoration.
            </h1>

            <p className="text-base sm:text-xl text-slate-200 leading-relaxed font-light">
              The Blue Carbon Initiative is a coordinated, global program building science, policy, and automated satellite verification to protect, restore, and finance coastal blue carbon ecosystems.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => onLaunchPillar('pillar1')}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#002B49] font-black text-sm flex items-center space-x-2 shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Launch Automated MRV Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onLaunchPillar('pillar4')}
                className="px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm flex items-center space-x-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-300" />
                <span>Enterprise Carbon Marketplace</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Global Metrics & Institutional Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#002B49] font-mono">10x Faster</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Carbon Sequestration Rate</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Coastal blue carbon habitats capture carbon up to ten times faster per hectare than mature tropical rainforests.
            </p>
          </div>

          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#059669] font-mono">50%+</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Sediment Carbon Storage</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stores carbon in waterlogged, anaerobic soils for millennia without oxygen-driven decomposition.
            </p>
          </div>

          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#0284C7] font-mono">GMW v3.0</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Anti-Fraud Gatekeeper</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated spatial verification against Global Mangrove Watch boundaries to prevent greenwashing.
            </p>
          </div>

          <div className="pt-3 lg:pt-0 lg:px-4 space-y-1">
            <div className="text-3xl font-black text-[#7C3AED] font-mono">1:1 Backed</div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Polygon Amoy Minting</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              1 MGROV Token = 1 Metric Ton CO₂ with permanent on-chain Proof of Burn for ESG compliance.
            </p>
          </div>
        </div>
      </section>

      {/* What is Blue Carbon? (The 3 Key Coastal Ecosystems) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Ecological Fundamentals
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#002B49] tracking-tight">
            What is Blue Carbon?
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            "Blue carbon" is the carbon stored in coastal and marine ecosystems. When protected or restored, coastal wetlands act as critical carbon sinks and natural storm barriers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mangroves */}
          <div className="bci-card rounded-2xl overflow-hidden flex flex-col justify-between group">
            <div className="relative h-56 overflow-hidden">
              <img
                src="/images/mangrove-roots.jpg"
                alt="Mangrove root stilt ecosystem"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#002B49]/90 text-white text-[11px] font-bold">
                Mangrove Forests
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-[#002B49]">Coastal Mangroves</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Intertidal trees adapted to saline coastal environments. Their complex root structures trap organic sediment, accumulating up to 1,000+ metric tons of carbon per hectare.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#006699]">
                <span>Sentinel-2 NDVI Monitored</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Seagrass Meadows */}
          <div className="bci-card rounded-2xl overflow-hidden flex flex-col justify-between group">
            <div className="relative h-56 overflow-hidden">
              <img
                src="/images/seagrass-meadow.jpg"
                alt="Seagrass meadows under ocean water"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#002B49]/90 text-white text-[11px] font-bold">
                Seagrass Meadows
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-[#002B49]">Seagrass Beds</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Submerged flowering plants forming extensive underwater meadows. Seagrass covers less than 0.2% of ocean floors but accounts for over 10% of total ocean carbon burial.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#006699]">
                <span>Deep Marine Sediment Carbon</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Tidal Salt Marshes */}
          <div className="bci-card rounded-2xl overflow-hidden flex flex-col justify-between group">
            <div className="relative h-56 overflow-hidden bg-gradient-to-tr from-[#003366] via-[#0284C7] to-[#0D9488] flex items-center justify-center p-6 text-white text-center">
              <div className="space-y-2">
                <Trees className="w-12 h-12 text-emerald-300 mx-auto" />
                <div className="text-lg font-bold">Tidal Salt Marshes</div>
                <p className="text-xs text-slate-200">Intertidal coastal grasslands & estuaries</p>
              </div>
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-[#002B49]">Tidal Salt Marshes</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Herbaceous wetlands flooded regularly by tides. Salt marsh soils build vertical layers of peat sediment, locking away atmospheric CO₂ under continuous saline immersion.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#006699]">
                <span>IPCC Tier-3 Wetland Models</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 MRV & Web3 Technological Pillars Interactive Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="bg-gradient-to-br from-[#002B49] via-[#071F36] to-[#04281E] text-white rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase">
              <Layers className="w-4 h-4" />
              <span>Full-Stack Digital MRV & Web3 Registry</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The 4 Technological Pillars of the Platform
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Replacing opaque human auditing and greenwashing with automated geospatial code, multi-spectral satellite telemetry, and transparent blockchain asset tokenization.
            </p>
          </div>

          {/* 4 Interactive Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div 
              onClick={() => onLaunchPillar('pillar1')}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-emerald-400/60 cursor-pointer transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase">Pillar 1</div>
                <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Anti-Fraud Gatekeeper
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pin GPS boundaries & cross-reference the Global Mangrove Watch dataset. Rejects skyscrapers or deserts instantly.
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 pt-2">
                <span>Launch Gatekeeper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div 
              onClick={() => onLaunchPillar('pillar2')}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-cyan-400/60 cursor-pointer transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Satellite className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase">Pillar 2</div>
                <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Satellite MRV Audit
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Automated Sentinel-2 NDVI calculation & scientific allometric biomass equations computing exact CO₂ tons.
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400 pt-2">
                <span>Run Satellite Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div 
              onClick={() => onLaunchPillar('pillar3')}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-teal-400/60 cursor-pointer transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono text-teal-400 font-bold uppercase">Pillar 3</div>
                <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  Web3 Tokenization
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  IPFS metadata bundle with unalterable CID hash & ERC-1155 Smart Contract minting on Polygon Amoy.
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-400 pt-2">
                <span>Mint Fractional Tokens</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Pillar 4 */}
            <div 
              onClick={() => onLaunchPillar('pillar4')}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 hover:border-blue-400/60 cursor-pointer transition-all duration-300 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-mono text-blue-400 font-bold uppercase">Pillar 4</div>
                <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                  B2B Net-Zero Store
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Corporate credit retirement (token burn) generating immutable ESG certificates and public tx hashes.
                </p>
              </div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400 pt-2">
                <span>Open ESG Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scientific & Policy Working Groups */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-xs font-bold text-[#006699] uppercase tracking-widest">
            Institutional Structure
          </h2>
          <h3 className="text-3xl font-extrabold text-[#002B49] tracking-tight">
            International Working Groups
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Blue Carbon Initiative brings together top marine scientists, economists, and climate policy experts to establish unified global standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Scientific Working Group */}
          <div className="bci-card p-8 rounded-2xl space-y-4 border-l-4 border-l-[#059669]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#002B49]">Scientific Working Group</h4>
                <p className="text-xs text-slate-500 font-mono">Biomass Allometry & Remote Sensing</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides scientific guidance on carbon measurement, stock assessment, and sequestration modeling. Authors of the international <em>Methodology for Coastal Blue Carbon Assessment</em>.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Tier-3 IPCC Wetlands Supplement Guidelines</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Copernicus Sentinel-2 & GMW Data Integration</span>
              </li>
            </ul>
          </div>

          {/* Policy Working Group */}
          <div className="bci-card p-8 rounded-2xl space-y-4 border-l-4 border-l-[#006699]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#002B49]">Policy & Finance Working Group</h4>
                <p className="text-xs text-slate-500 font-mono">NDCs, Carbon Markets & ESG Compliance</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Supports governments in integrating coastal wetlands into Nationally Determined Contributions (NDCs) under the Paris Agreement and structures transparent corporate carbon retirement mechanisms.
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span>SEBI BRSR & SEC Climate Disclosure Filings</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                <span>Permanent On-Chain Proof-of-Burn Retirement</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Verified Field Projects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
              Active Coastal Sites
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#002B49] tracking-tight">
              Verified Mangrove Field Projects
            </h3>
          </div>
          <button
            onClick={() => onLaunchPillar('pillar4')}
            className="text-xs font-bold text-[#006699] hover:text-[#002B49] flex items-center space-x-1"
          >
            <span>View all marketplace credits</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((proj) => (
            <div key={proj.id} className="bci-card rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">GMW Approved</span>
                  <span className="text-slate-500">${proj.tokenization.pricePerTonUSD.toFixed(2)} / Ton</span>
                </div>
                <h4 className="font-bold text-[#002B49] text-base">{proj.name}</h4>
                <p className="text-xs text-slate-500 font-mono">{proj.locationName}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">Total Sequestered:</div>
                  <div className="font-bold text-emerald-700">{proj.carbonMetrics.projectTotalCO2Tons.toLocaleString()} t</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Canopy NDVI:</div>
                  <div className="font-bold text-sky-700">{proj.carbonMetrics.ndvi}</div>
                </div>
              </div>

              <button
                onClick={() => onLaunchPillar('pillar4')}
                className="w-full py-2.5 rounded-xl bg-[#002B49] hover:bg-[#003B66] text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>Procure & Retire Credits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Global Co-Organizing Partners */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Co-Organized and Coordinated By
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80 grayscale hover:grayscale-0 transition-all">
            <div className="font-serif font-black text-xl text-[#002B49] tracking-tight">Conservation International</div>
            <div className="font-sans font-black text-xl text-[#006699] tracking-wider">IUCN</div>
            <div className="font-sans font-bold text-lg text-[#0D9488]">IOC-UNESCO</div>
            <div className="font-mono font-bold text-base text-slate-700">Global Mangrove Watch</div>
            <div className="font-mono font-bold text-base text-purple-700">Polygon Amoy</div>
          </div>
        </div>
      </section>
    </div>
  );
};
