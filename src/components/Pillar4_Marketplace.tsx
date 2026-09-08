import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Flame, 
  ShieldCheck, 
  Search, 
  Award,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TokenizedProject, RetirementRecord } from '../types';
import { apiRetireCredits } from '../services/apiClient';

interface Pillar4MarketplaceProps {
  projects: TokenizedProject[];
  onRetireCredits: (updatedProject: TokenizedProject, record: RetirementRecord) => void;
  onOpenCertificate: (record: RetirementRecord) => void;
  defaultCompanyWallet: string;
}

export const Pillar4_Marketplace: React.FC<Pillar4MarketplaceProps> = ({
  projects,
  onRetireCredits,
  onOpenCertificate,
  defaultCompanyWallet,
}) => {
  const [selectedProject, setSelectedProject] = useState<TokenizedProject | null>(null);
  const [retireAmount, setRetireAmount] = useState<number>(500);
  const [companyName, setCompanyName] = useState<string>('Tata Consultancy Services - NetZero FY26');
  const [companyWallet, setCompanyWallet] = useState<string>(defaultCompanyWallet || '0x43B2...88FA');
  const [purpose, setPurpose] = useState<string>('Scope 1 & 2 Emissions Neutralization for Cloud Data Centers');
  const [isRetiring, setIsRetiring] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ngoName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenRetireModal = (project: TokenizedProject) => {
    setSelectedProject(project);
    setRetireAmount(Math.min(500, project.tokenization.availableCredits));
  };

  const handleConfirmRetirement = async () => {
    if (!selectedProject || retireAmount <= 0) return;

    setIsRetiring(true);

    try {
      const { updatedProject, retirementRecord } = await apiRetireCredits(
        selectedProject,
        retireAmount,
        companyName,
        companyWallet,
        purpose
      );

      onRetireCredits(updatedProject, retirementRecord);
      setIsRetiring(false);
      setSelectedProject(null);

      // Celebration Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#06b6d4', '#10b981', '#fbbf24', '#ffffff'],
      });

      // Automatically open the verified ESG certificate
      onOpenCertificate(retirementRecord);
    } catch (err: any) {
      alert(err.message || 'Retirement failed');
      setIsRetiring(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pillar 4 Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#1e1b4b] border border-blue-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold">
            <ShoppingBag className="w-4 h-4" />
            <span>Pillar 4: B2B Enterprise Marketplace & ESG Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Enterprise Blue Carbon Store & On-Chain Credit Retirement
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Direct, verified procurement for Fortune 500 & enterprise Net-Zero roadmaps. Executing a purchase triggers a <span className="text-cyan-400 font-semibold">Smart Contract Credit Retirement (Burning)</span> that permanently locks units on Polygon Amoy, creating verifiable public audit proofs for <span className="text-emerald-400 font-semibold">BRSR / SEC ESG compliance</span>.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search verified mangrove projects, locations, or NGOs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-ocean-950 border border-ocean-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-400">
          <span className="font-mono text-emerald-400 font-bold">{filteredProjects.length} Verified Projects Available</span>
        </div>
      </div>

      {/* Project Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          return (
            <div
              key={project.id}
              className="glass-panel hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col justify-between space-y-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>GMW v3.0 Verified</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-black text-white">
                      ${project.tokenization.pricePerTonUSD.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">USD / Ton CO₂</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-base group-hover:text-cyan-300 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{project.locationName}</span>
                  </div>
                </div>
              </div>

              {/* MRV Telemetry Quick Stats */}
              <div className="grid grid-cols-3 gap-2 bg-ocean-950/80 p-3 rounded-xl border border-ocean-800 text-center font-mono text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Available</div>
                  <div className="font-bold text-emerald-400 text-xs mt-0.5">
                    {project.tokenization.availableCredits.toLocaleString()} t
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Canopy NDVI</div>
                  <div className="font-bold text-cyan-400 text-xs mt-0.5">
                    {project.carbonMetrics.ndvi}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Retired</div>
                  <div className="font-bold text-slate-300 text-xs mt-0.5">
                    {project.tokenization.retiredCredits.toLocaleString()} t
                  </div>
                </div>
              </div>

              {/* Co-Benefits Badges */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Ecological Co-Benefits:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.coBenefits.slice(0, 2).map((benefit, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-ocean-950 text-slate-300 border border-ocean-800 truncate max-w-[240px]"
                    >
                      🌱 {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer & Action */}
              <div className="pt-3 border-t border-ocean-800 flex items-center justify-between gap-3">
                <div className="text-[10px] font-mono text-slate-400">
                  <span>Token ID: </span>
                  <span className="text-teal-300 font-bold">{project.tokenization.tokenId}</span>
                </div>

                <button
                  onClick={() => handleOpenRetireModal(project)}
                  disabled={project.tokenization.availableCredits <= 0}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all disabled:opacity-40"
                >
                  <Flame className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Buy & Retire Credits</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Retirement Checkout Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-ocean-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">On-Chain Credit Retirement (Burn)</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedProject.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Retirement Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Corporate Beneficiary Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tata Consultancy Services - ESG Scope 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Corporate Wallet Address</label>
                <input
                  type="text"
                  value={companyWallet}
                  onChange={(e) => setCompanyWallet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Retirement Purpose / Compliance Claim</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. BRSR FY26 Scope 2 Data Center Decarbonization"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tons to Permanently Burn
                  </label>
                  <input
                    type="number"
                    max={selectedProject.tokenization.availableCredits}
                    min={1}
                    value={retireAmount}
                    onChange={(e) => setRetireAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Cost (USD)</label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-emerald-400 font-mono font-bold">
                    ${(retireAmount * selectedProject.tokenization.pricePerTonUSD).toLocaleString()} USD
                  </div>
                </div>
              </div>

              <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Irreversible Smart Contract Execution:</span>
                </div>
                <p>
                  Tokens will be permanently sent to the null address (<span className="font-mono text-slate-300">0x...dEaD</span>) on Polygon Amoy, generating an immutable transaction hash for your ESG filings.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2.5 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRetirement}
                disabled={isRetiring || retireAmount <= 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                {isRetiring ? (
                  <>
                    <Flame className="w-4 h-4 animate-bounce text-yellow-300" />
                    <span>Executing On-Chain Token Burn...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 text-white" />
                    <span>Execute Burn & Generate ESG Certificate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
