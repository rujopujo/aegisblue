import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Award, 
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  QrCode
} from 'lucide-react';
import { RetirementRecord, TokenizedProject } from '../types';
import { downloadESGCertificatePDF } from '../services/certificateGenerator';
import { generateVerificationUrl, generateQRCodeDataUrl } from '../services/qrService';
import { POLYGON_AMOY_CONFIG } from '../services/web3Registry';

interface ESGCertificateModalProps {
  record: RetirementRecord | null;
  project?: TokenizedProject;
  isOpen: boolean;
  onClose: () => void;
  onNavigateVerify?: (certificateId: string) => void;
}

export const ESGCertificateModal: React.FC<ESGCertificateModalProps> = ({
  record,
  project,
  isOpen,
  onClose,
  onNavigateVerify,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (record?.certificateId) {
      const url = generateVerificationUrl(record.certificateId);
      generateQRCodeDataUrl(url)
        .then(setQrDataUrl)
        .catch((err) => console.warn('[AegisBlue] QR generation failed:', err));
    }
  }, [record?.certificateId]);

  if (!isOpen || !record) return null;

  const verificationUrl = generateVerificationUrl(record.certificateId);
  const isBlockchainVerified = Boolean(
    record.txHash && 
    record.txHash.startsWith('0x') && 
    record.txHash.length === 66 && 
    record.burnReceiptBlock > 0
  );

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadESGCertificatePDF(record, project);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleOpenVerifyPage = () => {
    if (onNavigateVerify) {
      onNavigateVerify(record.certificateId);
      onClose();
    } else {
      window.open(verificationUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#070f26] border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-slate-100 overflow-y-auto max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-ocean-900 text-slate-400 hover:text-white hover:bg-ocean-800 transition-colors"
          aria-label="Close Modal"
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
              This certifies that blue carbon offset units have been permanently retired from circulation on behalf of:
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
                Metric Tons of CO₂ Equivalent Permanently Retired
              </div>
            </div>
          </div>

          {/* Details & Proof Grid with QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono bg-ocean-950/80 p-5 rounded-2xl border border-ocean-800">
            {/* Left: Project & Record Details */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Project & Beneficiary
              </div>
              <div>
                <span className="text-slate-400">Project Name:</span>
                <div className="text-white font-bold">{record.projectName}</div>
                <div className="text-[10px] text-slate-400">ID: {record.projectId}</div>
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
                <div className="text-slate-300 truncate" title={record.companyWallet}>
                  {record.companyWallet}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Date of Retirement:</span>
                <div className="text-slate-200">{new Date(record.retiredAt).toUTCString()}</div>
              </div>
            </div>

            {/* Middle: Blockchain & Contract Proofs */}
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-ocean-800 md:pl-4 pt-4 md:pt-0">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                On-Chain Cryptographic Proof
              </div>
              <div>
                <span className="text-slate-400">Network:</span>
                <div className="text-emerald-400 font-bold">Polygon Amoy (POS #80002)</div>
              </div>
              <div>
                <span className="text-slate-400">Contract Address:</span>
                <a
                  href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center space-x-1 truncate"
                >
                  <span className="truncate">{POLYGON_AMOY_CONFIG.contractAddress}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              {record.tokenId && (
                <div>
                  <span className="text-slate-400">Token ID (ERC-1155):</span>
                  <div className="text-teal-300 truncate font-mono text-[10px]" title={record.tokenId}>
                    {record.tokenId}
                  </div>
                </div>
              )}
              <div>
                <span className="text-slate-400">Transaction Hash:</span>
                {record.txHash ? (
                  <a
                    href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${record.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline flex items-center space-x-1 truncate"
                  >
                    <span className="truncate">{record.txHash}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <div className="text-slate-500">Off-Chain Record (Simulation)</div>
                )}
              </div>
              <div>
                <span className="text-slate-400">Polygon Block Number:</span>
                <div className="text-slate-200">
                  {record.burnReceiptBlock > 0 ? `#${record.burnReceiptBlock.toLocaleString()}` : 'N/A'}
                </div>
              </div>
              {record.ipfsCertificateCid && (
                <div>
                  <span className="text-slate-400">IPFS Audit CID:</span>
                  <div className="text-teal-300 truncate text-[10px]">{record.ipfsCertificateCid}</div>
                </div>
              )}
            </div>

            {/* Right: Verification QR Code & Status */}
            <div className="flex flex-col items-center justify-between border-t md:border-t-0 md:border-l border-ocean-800 md:pl-4 pt-4 md:pt-0 space-y-3">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center">
                Instant Verification QR
              </div>

              {/* QR Container */}
              <div className="p-2.5 rounded-2xl bg-white shadow-lg shadow-emerald-500/10 border-2 border-emerald-400/40">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Certificate Verification QR Code"
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-slate-400 text-[10px]">
                    <QrCode className="w-8 h-8 animate-pulse text-emerald-600" />
                  </div>
                )}
              </div>

              <div className="text-center space-y-1">
                <p className="text-[10px] text-emerald-400 font-bold">
                  Scan to verify this certificate.
                </p>
                <div className="flex items-center space-x-1.5 justify-center">
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-ocean-900 hover:bg-ocean-800 text-[10px] text-slate-300 transition-colors"
                    title="Copy public verification link"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{isCopied ? 'Copied' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={handleOpenVerifyPage}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 text-[10px] text-cyan-300 border border-cyan-800/60 transition-colors"
                  >
                    <span>Verify Page</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Verified Status Pill */}
              <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                isBlockchainVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}>
                {isBlockchainVerified ? 'Verified on Polygon Amoy' : 'Off-Chain Record'}
              </div>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 gap-2">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cryptographically secured against greenwashing & double-spending</span>
            </div>
            <div className="font-mono text-emerald-400 font-bold">
              SEBI BRSR / SEC Net-Zero Audit Ready
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleOpenVerifyPage}
            className="px-4 py-2.5 rounded-xl bg-ocean-900 hover:bg-ocean-800 text-cyan-300 text-xs font-semibold flex items-center space-x-2 border border-cyan-900/50 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Open Public Verification Page</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-ocean-900 hover:bg-ocean-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-ocean-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Compiling PDF...' : 'Download High-Res PDF Certificate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
