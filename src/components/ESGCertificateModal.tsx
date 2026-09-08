import React from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Award, 
  CheckCircle2 
} from 'lucide-react';
import { RetirementRecord, TokenizedProject } from '../types';
import { downloadESGCertificatePDF } from '../services/certificateGenerator';
import { POLYGON_AMOY_CONFIG } from '../services/web3Registry';

interface ESGCertificateModalProps {
  record: RetirementRecord | null;
  project?: TokenizedProject;
  isOpen: boolean;
  onClose: () => void;
}

export const ESGCertificateModal: React.FC<ESGCertificateModalProps> = ({
  record,
  project,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  const handleDownload = () => {
    downloadESGCertificatePDF(record, project);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#070f26] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-slate-100 overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-ocean-900 text-slate-400 hover:text-white hover:bg-ocean-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Inner Frame */}
        <div className="border border-emerald-500/30 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-[#09173a] via-[#070f26] to-[#041a14] space-y-6 relative overflow-hidden">
          {/* Subtle Watermark */}
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <Award className="w-80 h-80 text-emerald-400" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b border-ocean-800 pb-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AegisBlue Verified Carbon Standard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              Official Certificate of Carbon Retirement
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Irrevocable On-Chain Burn Verification | Sentinel-2 Satellite MRV
            </p>
          </div>

          {/* Beneficiary Statement */}
          <div className="text-center space-y-3">
            <p className="text-xs text-slate-300">
              This certifies that carbon offset units have been permanently retired from circulation on behalf of:
            </p>
            <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              {record.companyName}
            </div>

            {/* Retired Metric Tons Badge */}
            <div className="inline-block py-3 px-8 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 shadow-inner">
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {record.tonsRetired.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                Metric Tons of CO₂ Equivalent Retired
              </div>
            </div>
          </div>

          {/* Details & Proof Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-ocean-950/80 p-4 rounded-xl border border-ocean-800">
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-400">Project Name:</span>
                <div className="text-white font-bold">{record.projectName}</div>
              </div>
              <div>
                <span className="text-slate-400">Certificate ID:</span>
                <div className="text-cyan-300 font-bold">{record.certificateId}</div>
              </div>
              <div>
                <span className="text-slate-400">Purpose / Scope:</span>
                <div className="text-slate-200">{record.purpose}</div>
              </div>
              <div>
                <span className="text-slate-400">Beneficiary Wallet:</span>
                <div className="text-slate-300 truncate">{record.companyWallet}</div>
              </div>
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-ocean-800 sm:pl-4 pt-3 sm:pt-0">
              <div>
                <span className="text-slate-400">Network:</span>
                <div className="text-emerald-400 font-bold">Polygon Amoy Testnet (POS)</div>
              </div>
              <div>
                <span className="text-slate-400">Transaction Hash:</span>
                <a
                  href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${record.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline truncate block"
                >
                  {record.txHash.slice(0, 22)}...
                </a>
              </div>
              <div>
                <span className="text-slate-400">IPFS Audit CID:</span>
                <div className="text-teal-300 truncate">{record.ipfsCertificateCid}</div>
              </div>
              <div>
                <span className="text-slate-400">Date of Retirement:</span>
                <div className="text-slate-200">{new Date(record.retiredAt).toUTCString()}</div>
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cryptographically secured against greenwashing & double-spending</span>
            </div>
            <div className="font-mono text-emerald-400 font-bold">
              BRSR / SEC Net-Zero Audit Ready
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-ocean-900 hover:bg-ocean-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-ocean-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res PDF Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
