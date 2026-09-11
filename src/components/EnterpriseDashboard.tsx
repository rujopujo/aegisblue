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
import { POLYGON_AMOY_CONFIG } from '../services/web3Registry';

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
      {/* Dashboard Header - Clean Institutional Navy Banner */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-[#002B49] text-white border border-slate-700 shadow-md">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Corporate ESG & Net-Zero Compliance Suite</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Decarbonization Portfolio & Immutable Audit Registry
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            Audit-ready ESG tracking for SEBI BRSR, SEC Climate Disclosure, and GHG Protocol Scope 1-3. All carbon retirements are secured by automated satellite MRV and burned on Polygon Amoy.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards Grid - Clean White Nature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Retired */}
        <div className="bg-white p-5 rounded-2xl space-y-2 border border-slate-200 border-l-4 border-l-[#059669] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>On-Chain Retired</span>
            <Flame className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-3xl font-black text-[#002B49] font-mono">
            {totalRetiredTons.toLocaleString()} <span className="text-sm font-normal text-slate-500">t CO₂</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Irrevocably burned on Polygon POS
          </div>
        </div>

        {/* Net-Zero Target Progress */}
        <div className="bg-white p-5 rounded-2xl space-y-2 border border-slate-200 border-l-4 border-l-[#0284C7] shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>FY26 Net-Zero Target</span>
            <TrendingDown className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="text-3xl font-black text-[#0284C7] font-mono">
            {progressPercent}% <span className="text-xs text-slate-500">({totalRetiredTons}/{corporateTargetTons} t)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-[#059669] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Mangrove Hectares Protected */}
        <div className="bg-white p-5 rounded-2xl space-y-2 border border-slate-200 border-l-4 border-l-teal-600 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Hectares Conserved</span>
            <Trees className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black text-[#002B49] font-mono">
            {totalHectaresProtected.toLocaleString()} <span className="text-sm font-normal text-slate-500">ha</span>
          </div>
          <div className="text-[11px] text-slate-500">
            GMW v3.0 Monitored coastal biomes
          </div>
        </div>

        {/* Coastal Community Livelihoods */}
        <div className="bg-white p-5 rounded-2xl space-y-2 border border-slate-200 border-l-4 border-l-amber-600 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Coastal Livelihoods</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-[#002B49] font-mono">
            {estCommunityLivelihoods.toLocaleString()}+ <span className="text-sm font-normal text-slate-500">people</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Women-led mangrove stewardship co-ops
          </div>
        </div>
      </div>

      {/* Irrevocable On-Chain Retirement Audit Table - Clean Light Card */}
      <div className="bg-white p-6 rounded-2xl space-y-5 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-[#059669]" />
            <h3 className="font-bold text-[#002B49] text-base">
              Verified Carbon Retirement Ledger (Proof of Burn)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
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
                <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px]">
                  <th className="pb-3">Certificate ID / Beneficiary</th>
                  <th className="pb-3">Project Origin</th>
                  <th className="pb-3 text-right">Tons Retired</th>
                  <th className="pb-3">Retirement Purpose</th>
                  <th className="pb-3">Polygon Tx Hash</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {retirements.map((rec) => {
                  const proj = projects.find((p) => p.id === rec.projectId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-[#002B49] font-mono">{rec.certificateId}</div>
                        <div className="text-slate-600 text-[11px] font-semibold mt-0.5">{rec.companyName}</div>
                      </td>

                      <td className="py-4 pr-4 max-w-[220px]">
                        <div className="text-slate-800 font-medium truncate">{rec.projectName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(rec.retiredAt).toLocaleDateString()}
                          {rec.tokenId && (
                            <span className="ml-2 text-slate-600">
                              • Token: {rec.tokenId.length > 14 ? `${rec.tokenId.slice(0, 6)}...${rec.tokenId.slice(-4)}` : rec.tokenId}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 pr-4 text-right font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                          {rec.tonsRetired.toLocaleString()} t CO₂
                        </span>
                      </td>

                      <td className="py-4 pr-4 max-w-[200px]">
                        <div className="text-slate-600 text-[11px] line-clamp-2">{rec.purpose}</div>
                      </td>

                      <td className="py-4 pr-4 font-mono text-[10px]">
                        {rec.txHash ? (
                          <a
                            href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${rec.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 hover:underline flex items-center space-x-1 font-semibold"
                          >
                            <span>{rec.txHash.slice(0, 14)}...</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-mono">
                            Off-Chain Record
                          </span>
                        )}
                        {rec.burnReceiptBlock > 0 && (
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            Block #{rec.burnReceiptBlock}
                          </div>
                        )}
                      </td>

                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => onOpenCertificate(rec)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
                        >
                          View
                        </button>
                        {onNavigateVerify && (
                          <button
                            onClick={() => onNavigateVerify(rec.certificateId)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
                            title="Verify on public portal"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => downloadESGCertificatePDF(rec, proj)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all shadow-sm"
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
