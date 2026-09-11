import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Flame, 
  ShieldCheck, 
  MapPin, 
  Layers, 
  ArrowUpRight, 
  Waves,
  Sparkles,
  Info,
  SlidersHorizontal,
  ExternalLink,
  Satellite,
  CheckCircle,
  X
} from 'lucide-react';
import { CarbonProject, ESGCertificateData, OffsetOrder } from '../types/marketplace';
import { ESGCertificateModal } from './ESGCertificateModal';

interface Pillar4MarketplaceProps {
  projects: CarbonProject[];
  orders: OffsetOrder[];
  onRetirementComplete: (order: OffsetOrder, certificate: ESGCertificateData) => void;
  onNavigateToDashboard: () => void;
}

export const Pillar4_Marketplace: React.FC<Pillar4MarketplaceProps> = ({
  projects,
  orders,
  onRetirementComplete,
  onNavigateToDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'PRICE_ASC' | 'PRICE_DESC' | 'TONS_DESC' | 'SCORE_DESC'>('TONS_DESC');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<CarbonProject | null>(null);
  const [inspectingProject, setInspectingProject] = useState<CarbonProject | null>(null);

  // Filter & Sort projects
  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesEcosystem = 
        selectedEcosystem === 'ALL' || project.ecosystemType === selectedEcosystem;

      return matchesSearch && matchesEcosystem;
    })
    .sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return a.pricePerTon - b.pricePerTon;
      if (sortBy === 'PRICE_DESC') return b.pricePerTon - a.pricePerTon;
      if (sortBy === 'TONS_DESC') return b.availableTons - a.availableTons;
      if (sortBy === 'SCORE_DESC') return b.auditScore - a.auditScore;
      return 0;
    });

  // Aggregate metrics
  const totalAvailableTons = projects.reduce((acc, p) => acc + p.availableTons, 0);
  const totalVerifiedTons = projects.reduce((acc, p) => acc + p.totalTons, 0);
  const totalRetiredTons = orders.reduce((acc, o) => acc + o.tonsRetired, 0);

  return (
    <div className="space-y-8">
      {/* Hero Banner with Thetan Arena Cosmic / Neon Styling */}
      <div className="relative rounded-3xl overflow-hidden border border-[rgba(0,229,255,0.25)] bg-gradient-to-br from-[#101230] via-[#0d0e26] to-[#150f33] p-8 md:p-10 shadow-[0_0_40px_rgba(0,0,0,0.7)]">
        {/* Glow Spheres */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#a855f7]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-[#00e5ff] text-xs font-bold tracking-widest uppercase shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <Waves className="w-3.5 h-3.5 animate-pulse" />
            PILLAR 4 ΓÇó VERIFIED BLUE CARBON MARKETPLACE & PROOF-OF-BURN
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#eef2ff] leading-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            INSTITUTIONAL BLUE CARBON STOREFRONT & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#3d7aff] to-[#a855f7]">ON-CHAIN RETIREMENT</span>
          </h1>

          <p className="text-[#94a3c8] text-sm md:text-base leading-relaxed">
            Acquire and retire verified Blue Carbon Credits originating from satellite-audited coastal mangroves, tidal wetlands, and seagrass meadows. Every retirement permanently burns tokens on Polygon Amoy, issuing verifiable ESG Certificates of Recognition.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 items-center">
            <button
              onClick={() => setSelectedProjectForModal(projects[0])}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] hover:from-[#00c6ff] hover:to-[#3d7aff] text-[#0a0b1e] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Flame className="w-4 h-4" />
              Quick Retire Credits
            </button>

            <button
              onClick={onNavigateToDashboard}
              className="px-5 py-3.5 rounded-xl bg-[#141538] hover:bg-[#191a40] border border-[rgba(99,102,241,0.3)] text-[#eef2ff] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              Enterprise ESG Dashboard
              <ArrowUpRight className="w-4 h-4 text-[#00e5ff]" />
            </button>
          </div>
        </div>

        {/* Real-time Platform Stats Bar */}
        <div className="mt-8 pt-6 border-t border-[rgba(99,102,241,0.2)] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-[#141538]/60 border border-[rgba(99,102,241,0.15)]">
            <div className="text-[11px] uppercase font-semibold text-[#94a3c8]">Total Verified Supply</div>
            <div className="text-xl md:text-2xl font-black text-[#eef2ff] font-mono mt-0.5">
              {totalVerifiedTons.toLocaleString()} <span className="text-xs text-[#00e5ff] font-sans">tCO2e</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#141538]/60 border border-[rgba(99,102,241,0.15)]">
            <div className="text-[11px] uppercase font-semibold text-[#94a3c8]">Available in Pool</div>
            <div className="text-xl md:text-2xl font-black text-[#00e5ff] font-mono mt-0.5">
              {totalAvailableTons.toLocaleString()} <span className="text-xs text-[#94a3c8] font-sans">tCO2e</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#141538]/60 border border-[rgba(99,102,241,0.15)]">
            <div className="text-[11px] uppercase font-semibold text-[#94a3c8]">Permanently Burned</div>
            <div className="text-xl md:text-2xl font-black text-[#a855f7] font-mono mt-0.5">
              {totalRetiredTons.toLocaleString()} <span className="text-xs text-[#94a3c8] font-sans">tCO2e</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#141538]/60 border border-[rgba(99,102,241,0.15)]">
            <div className="text-[11px] uppercase font-semibold text-[#94a3c8]">Settlement Network</div>
            <div className="text-xs md:text-sm font-bold text-[#39ff14] font-mono mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
              Polygon Amoy (80002)
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Thetan Arena Marketplace Filter Style) */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#101230] p-4 rounded-2xl border border-[rgba(99,102,241,0.2)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#94a3c8]" />
          <input
            type="text"
            placeholder="Search Sundarbans, Pichavaram, Bhitarkanika..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0b1e] border border-[rgba(99,102,241,0.25)] rounded-xl pl-10 pr-4 py-2 text-xs text-[#eef2ff] placeholder-[#5b6486] focus:outline-none focus:border-[#00e5ff] focus:shadow-[0_0_12px_rgba(0,229,255,0.2)] transition-all"
          />
        </div>

        {/* Ecosystem Filter Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          {['ALL', 'Mangrove', 'Tidal Wetland', 'Seagrass Meadow'].map((eco) => (
            <button
              key={eco}
              onClick={() => setSelectedEcosystem(eco)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                selectedEcosystem === eco
                  ? 'bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] text-[#0a0b1e] shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                  : 'bg-[#141538] hover:bg-[#191a40] text-[#94a3c8] hover:text-[#eef2ff] border border-[rgba(99,102,241,0.2)]'
              }`}
            >
              {eco === 'ALL' ? 'All Ecosystems' : eco}
            </button>
          ))}

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#141538] border border-[rgba(99,102,241,0.25)] rounded-xl px-3 py-1.5 text-xs text-[#94a3c8] focus:outline-none focus:border-[#00e5ff] cursor-pointer"
            >
              <option value="TONS_DESC">Supply: High to Low</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="SCORE_DESC">MRV Audit Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Project Cards Grid (Thetan Arena NFT Card Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const retiredTons = project.totalTons - project.availableTons;
          const retiredPercent = Math.round((retiredTons / project.totalTons) * 100);

          return (
            <div
              key={project.id}
              className="group relative bg-gradient-to-b from-[#141538] to-[#0d0e26] rounded-2xl border border-[rgba(99,102,241,0.2)] hover:border-[#00e5ff] transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(0,229,255,0.25)] transform hover:-translate-y-1"
            >
              {/* Card Image Banner */}
              <div className="relative h-52 w-full overflow-hidden">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e26] via-[#0d0e26]/50 to-transparent" />
                
                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#0a0b1e]/85 backdrop-blur-md text-[10px] font-bold tracking-wider text-[#00e5ff] border border-[#00e5ff]/40 flex items-center gap-1 shadow-[0_0_8px_rgba(0,229,255,0.3)]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00e5ff]" />
                    NDVI {project.ndviScore} (SENTINEL-2)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#0a0b1e]/85 backdrop-blur-md text-[10px] font-bold tracking-wider text-[#a855f7] border border-[#a855f7]/40 shadow-[0_0_8px_rgba(168,85,247,0.25)]">
                    {project.ecosystemType.toUpperCase()}
                  </span>
                </div>

                {/* Satellite Pill */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-lg bg-[#0a0b1e]/85 text-[10px] font-mono text-[#39ff14] border border-[#39ff14]/30 flex items-center gap-1">
                    <Satellite className="w-3 h-3" />
                    MRV {project.auditScore}%
                  </span>
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#00e5ff] font-bold bg-[#0a0b1e]/90 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                      {project.code}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#eef2ff] mt-1" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.3px' }}>
                      {project.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-[#94a3c8] block">Price / t</span>
                    <span className="text-xl font-black text-[#00e5ff] font-mono drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]">
                      ${project.pricePerTon.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center text-xs text-[#94a3c8] gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>{project.region}, {project.state}</span>
                    <span className="mx-1 text-[#5b6486]">ΓÇó</span>
                    <span>{project.hectares.toLocaleString()} Hectares</span>
                  </div>

                  <p className="text-xs text-[#94a3c8] leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {/* Satellite & Scientific Audit Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#0a0b1e] border border-[rgba(99,102,241,0.2)]">
                      <div className="text-[10px] text-[#94a3c8]">Soil Organic Carbon</div>
                      <div className="font-mono font-bold text-[#eef2ff] mt-0.5">
                        {project.soilOrganicCarbon} <span className="text-[10px] text-[#94a3c8]">g/cm┬│ (CCN)</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#0a0b1e] border border-[rgba(99,102,241,0.2)]">
                      <div className="text-[10px] text-[#94a3c8]">Annual Rate</div>
                      <div className="font-mono font-bold text-[#00e5ff] mt-0.5">
                        {project.sequestrationRate || 8.8} <span className="text-[10px] text-[#94a3c8]">t/ha/yr</span>
                      </div>
                    </div>
                  </div>

                  {/* Credit Pool Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#94a3c8]">Available Credits</span>
                      <span className="font-mono font-bold text-[#00e5ff]">
                        {project.availableTons.toLocaleString()} / {project.totalTons.toLocaleString()} t
                      </span>
                    </div>
                    <div className="w-full bg-[#0a0b1e] h-2 rounded-full overflow-hidden border border-[rgba(99,102,241,0.2)]">
                      <div 
                        className="bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                        style={{ width: `${100 - retiredPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#5b6486]">
                      <span>{retiredPercent}% Burned ({retiredTons.toLocaleString()} t)</span>
                      <span>Polygon Token ID #{project.polygonTokenId}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setSelectedProjectForModal(project)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] hover:from-[#00c6ff] hover:to-[#3d7aff] text-[#0a0b1e] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all transform hover:-translate-y-0.5"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Retire Credits
                  </button>

                  <button
                    onClick={() => setInspectingProject(project)}
                    className="py-3 px-4 rounded-xl bg-[#0a0b1e] hover:bg-[#141538] border border-[rgba(99,102,241,0.3)] hover:border-[#00e5ff] text-[#eef2ff] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <Info className="w-3.5 h-3.5 text-[#00e5ff]" />
                    MRV Dossier
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buy & Retire ESG Certificate Modal */}
      <ESGCertificateModal
        project={selectedProjectForModal}
        isOpen={!!selectedProjectForModal}
        onClose={() => setSelectedProjectForModal(null)}
        onRetirementComplete={onRetirementComplete}
      />

      {/* Scientific MRV Dossier Inspection Modal */}
      {inspectingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070814]/85 backdrop-blur-xl">
          <div className="relative w-full max-w-2xl bg-[#0f1029] border border-[rgba(0,229,255,0.3)] rounded-3xl p-6 md:p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30">
                  {inspectingProject.code} ΓÇó AUDITED DOSSIER
                </span>
                <h3 className="text-xl font-bold text-[#eef2ff] mt-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                  {inspectingProject.name}
                </h3>
                <p className="text-xs text-[#94a3c8]">
                  {inspectingProject.ecosystemType} ΓÇó {inspectingProject.region}, {inspectingProject.state}
                </p>
              </div>
              <button
                onClick={() => setInspectingProject(null)}
                className="p-1.5 rounded-lg bg-[#141538] text-[#94a3c8] hover:text-[#eef2ff]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0a0b1e] border border-[rgba(99,102,241,0.2)] space-y-2">
                <div className="text-[#00e5ff] font-bold uppercase tracking-wider">MRV Scientific Methodology</div>
                <p className="text-[#94a3c8] leading-relaxed">
                  Calibrated against Smithsonian Coastal Carbon Network (CCN) soil organic carbon cores. Aboveground biomass index is continually audited using European Space Agency Sentinel-2 multispectral MSI telemetry (Bands 4 & 8 for NDVI).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 rounded-xl bg-[#0a0b1e] border border-[rgba(99,102,241,0.2)]">
                  <span className="text-[#94a3c8] block">Polygon Token ID:</span>
                  <span className="text-[#00e5ff] font-bold">#{inspectingProject.polygonTokenId}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0b1e] border border-[rgba(99,102,241,0.2)]">
                  <span className="text-[#94a3c8] block">Smart Contract:</span>
                  <span className="text-[#eef2ff] truncate block">{inspectingProject.polygonContractAddress}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0a0b1e] border border-[rgba(99,102,241,0.2)] col-span-2">
                  <span className="text-[#94a3c8] block">IPFS Telemetry Dossier CID:</span>
                  <a 
                    href={`https://ipfs.io/ipfs/${inspectingProject.ipfsDossierCid}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[#a855f7] hover:underline truncate block"
                  >
                    ipfs://{inspectingProject.ipfsDossierCid}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const proj = inspectingProject;
                  setInspectingProject(null);
                  setSelectedProjectForModal(proj);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] text-[#0a0b1e] font-extrabold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.3)]"
              >
                Proceed to Retire
              </button>
              <button
                onClick={() => setInspectingProject(null)}
                className="py-3 px-5 rounded-xl bg-[#141538] text-[#94a3c8] hover:text-[#eef2ff] text-xs font-bold uppercase"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
