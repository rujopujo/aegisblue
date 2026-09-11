import React from 'react';
import { 
  BarChart3, 
  Flame, 
  ExternalLink, 
  Trees, 
  Users, 
  FileCheck,
  TrendingDown
} from 'lucide-react';
import { RetirementRecord, TokenizedProject } from '../types';
import { downloadESGCertificatePDF } from '../services/certificateGenerator';
import { POLYGON_AMOY_CONFIG, isRealAmoyTxHash } from '../services/web3Registry';

interface EnterpriseDashboardProps {
  retirements: RetirementRecord[];
  projects: TokenizedProject[];
  onOpenCertificate: (record: RetirementRecord) => void;
  onNavigateVerify?: (certificateId: string) => void;
}

export const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({
  retirements,
  projects,
  onOpenCertificate,
  onNavigateVerify,
}) => {
  const totalRetiredTons = retirements.reduce((acc, curr) => acc + curr.tonsRetired, 0);
  const totalHectaresProtected = Math.round(totalRetiredTons / 18.5);
  const estCommunityLivelihoods = Math.round(totalRetiredTons * 0.45);

  // Corporate Net-Zero Goal Benchmark (e.g. 5,000 Ton Annual Target)
  const corporateTargetTons = 5000;
  const progressPercent = Math.min(100, Math.round((totalRetiredTons / corporateTargetTons) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Dashboard Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#3b0764] border border-purple-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
            <BarChart3 className="w-4 h-4" />
            <span>Corporate ESG & Net-Zero Compliance Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Decarbonization Portfolio & Immutable Audit Registry
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Audit-ready ESG tracking for SEBI BRSR, SEC Climate Disclosure, and GHG Protocol Scope 1-3. All carbon retirements are secured by automated satellite MRV and burned on Polygon Amoy.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Retired */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-cyan-400">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>On-Chain Retired</span>
            <Flame className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {totalRetiredTons.toLocaleString()} <span className="text-sm font-normal text-cyan-300">t CO₂</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Irrevocably burned on Polygon POS
          </div>
        </div>

        {/* Net-Zero Target Progress */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-emerald-400">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>FY26 Net-Zero Target</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {progressPercent}% <span className="text-xs text-slate-400">({totalRetiredTons}/{corporateTargetTons} t)</span>
          </div>
          <div className="w-full bg-ocean-950 rounded-full h-2 overflow-hidden border border-ocean-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Mangrove Hectares Protected */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-teal-400">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Hectares Conserved</span>
            <Trees className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-300 font-mono">
            {totalHectaresProtected.toLocaleString()} <span className="text-sm font-normal text-teal-400">ha</span>
          </div>
          <div className="text-[11px] text-slate-400">
            GMW v3.0 Monitored coastal biomes
          </div>
        </div>

        {/* Coastal Community Livelihoods */}
        <div className="glass-panel p-5 rounded-2xl space-y-2 border-l-4 border-l-purple-400">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Coastal Livelihoods</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300 font-mono">
            {estCommunityLivelihoods.toLocaleString()}+ <span className="text-sm font-normal text-purple-400">people</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Women-led mangrove stewardship co-ops
          </div>
        </div>
      </div>

      {/* Irrevocable On-Chain Retirement Audit Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ocean-800 pb-4">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Verified Carbon Retirement Ledger (Proof of Burn)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Exportable for Formal ESG / BRSR Filings
          </span>
        </div>

        {retirements.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-mono">
            No carbon credits retired yet. Browse the B2B Marketplace to execute an on-chain retirement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-ocean-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3">Certificate ID / Beneficiary</th>
                  <th className="pb-3">Project Origin</th>
                  <th className="pb-3 text-right">Tons Retired</th>
                  <th className="pb-3">Retirement Purpose</th>
                  <th className="pb-3">Polygon Tx Hash</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ocean-850">
                {retirements.map((rec) => {
                  const proj = projects.find((p) => p.id === rec.projectId);

                  return (
                    <tr key={rec.id} className="hover:bg-ocean-900/60 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-cyan-300 font-mono">{rec.certificateId}</div>
                        <div className="text-slate-300 text-[11px] font-semibold mt-0.5">{rec.companyName}</div>
                      </td>

                      <td className="py-4 pr-4 max-w-[220px]">
                        <div className="text-slate-100 font-medium truncate">{rec.projectName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(rec.retiredAt).toLocaleDateString()}
                          {rec.tokenId && (
                            <span className="ml-2 text-cyan-300">
                              • Token: {rec.tokenId.length > 14 ? `${rec.tokenId.slice(0, 6)}...${rec.tokenId.slice(-4)}` : rec.tokenId}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 pr-4 text-right font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          {rec.tonsRetired.toLocaleString()} t CO₂
                        </span>
                      </td>

                      <td className="py-4 pr-4 max-w-[200px]">
                        <div className="text-slate-300 text-[11px] line-clamp-2">{rec.purpose}</div>
                      </td>

                      <td className="py-4 pr-4 font-mono text-[10px]">
                        {rec.txHash ? (
                          isRealAmoyTxHash(rec.txHash, rec.burnReceiptBlock) ? (
                            <a
                              href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${rec.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-400 hover:underline flex items-center space-x-1"
                              title={rec.txHash}
                            >
                              <span>{rec.txHash.slice(0, 12)}...</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-slate-300 font-mono text-[10px]" title={rec.txHash}>
                                {rec.txHash.slice(0, 10)}...
                              </span>
                              <div>
                                <a
                                  href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] text-teal-400 hover:underline inline-flex items-center space-x-0.5"
                                  title="Inspect verified smart contract on PolygonScan"
                                >
                                  <span>Demo Ref</span>
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                </a>
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                            Off-Chain Record
                          </span>
                        )}
                        {rec.burnReceiptBlock > 0 && (
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            Block #{rec.burnReceiptBlock} {isRealAmoyTxHash(rec.txHash, rec.burnReceiptBlock) ? '' : '(Demo)'}
                          </div>
                        )}
                      </td>

                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => onOpenCertificate(rec)}
                          className="px-2.5 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-cyan-300 text-xs font-semibold border border-ocean-700 transition-colors"
                        >
                          View
                        </button>
                        {onNavigateVerify && (
                          <button
                            onClick={() => onNavigateVerify(rec.certificateId)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-colors"
                            title="Verify on public portal"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => downloadESGCertificatePDF(rec, proj)}
                          className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
