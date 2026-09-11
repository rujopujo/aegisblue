import React, { useEffect, useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Check, 
  Copy, 
  Award,
  TreePine,
  PlaneTakeoff
} from 'lucide-react';
import { RetirementRecord, TokenizedProject } from '../types';
import { downloadESGCertificatePDF } from '../services/certificateGenerator';
import { generateVerificationUrl, generateQRCodeDataUrl } from '../services/qrService';

interface ESGCertificateModalProps {
  record: RetirementRecord | null;
  project: TokenizedProject | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateVerify?: (certId: string) => void;
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
  const treesEquiv = Math.round(record.tonsRetired * 5);
  const flightsEquiv = Math.round(record.tonsRetired * 0.85);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadESGCertificatePDF(record, project || undefined);
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <Award className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Official ESG Certificate of Recognition
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                {record.certificateId} • Verified On-Chain
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* HIGH-FIDELITY GOLDEN ORNAMENTAL CERTIFICATE MATCHING REFERENCE IMAGE */}
          <div 
            className="relative rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden text-center select-none"
            style={{
              backgroundColor: '#FAF6EC',
              color: '#2b2316',
              border: '8px double #C5A059',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
            }}
          >
            {/* Inner Border Lines */}
            <div className="absolute inset-2 border border-[#C5A059]/60 pointer-events-none rounded-lg" />
            <div className="absolute inset-3 border border-[#997328]/30 pointer-events-none rounded-lg" />

            {/* Corner Scroll Flourishes */}
            <div className="absolute top-4 left-4 text-[#C5A059] text-xl select-none">❧</div>
            <div className="absolute top-4 right-4 text-[#C5A059] text-xl select-none">☙</div>
            <div className="absolute bottom-4 left-4 text-[#C5A059] text-xl select-none">❧</div>
            <div className="absolute bottom-4 right-4 text-[#C5A059] text-xl select-none">☙</div>

            {/* Top Golden Ribbon Banner */}
            <div 
              className="inline-block relative px-8 py-1.5 mb-3 rounded shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #c5a059, #dfbe78, #b8860b)',
                color: '#ffffff',
                border: '1px solid #997328'
              }}
            >
              <span className="font-serif font-bold text-xs uppercase tracking-widest text-white drop-shadow-sm">
                The Blue Carbon Initiative
              </span>
            </div>

            {/* Certificate Title */}
            <h3 
              className="text-2xl md:text-3xl font-black tracking-wider uppercase mb-1"
              style={{
                fontFamily: 'Cinzel, serif',
                color: '#9E7724'
              }}
            >
              Certificate of Recognition
            </h3>

            <p className="text-[11px] font-serif uppercase tracking-widest text-[#785A23] mb-2">
              Verified Blue Carbon Offset Retirement & ESG Compliance
            </p>

            {/* Divider: ── ••• ── */}
            <div className="flex items-center justify-center gap-2 my-2 text-[#C5A059]">
              <div className="w-16 h-[1px] bg-[#C5A059]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#9E7724]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
              <div className="w-16 h-[1px] bg-[#C5A059]" />
            </div>

            {/* Presented To */}
            <p className="text-[10px] uppercase tracking-widest text-[#6B5738] font-serif mt-2">
              This Certificate is Proudly Presented To
            </p>

            {/* Beneficiary Name in Calligraphy Font */}
            <div className="my-2">
              <span 
                className="text-3xl md:text-4xl text-[#231E14] block leading-tight"
                style={{
                  fontFamily: 'Great Vibes, cursive',
                  letterSpacing: '1px'
                }}
              >
                {record.companyName}
              </span>
              <div className="w-48 h-[1px] bg-[#C5A059] mx-auto mt-1" />
            </div>

            {/* Statement */}
            <p className="text-xs italic text-[#4A3C26] font-serif max-w-xl mx-auto leading-relaxed my-3">
              For the permanent, verified retirement of <strong className="font-bold text-[#8C641E] not-italic">{record.tonsRetired.toLocaleString()} Metric Tonnes of CO2e</strong> from global atmospheric circulation. Sourced from <span className="font-semibold not-italic">{project?.name || record.projectName}</span>, audited via Sentinel-2 Multispectral satellite telemetry and immutably recorded on Polygon Amoy.
            </p>

            {/* Bottom Seals and Signature Lines */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#C5A059]/40 text-left">
              
              {/* Date on Left */}
              <div className="text-center sm:text-left">
                <div className="font-serif font-bold text-sm text-[#231E14]">
                  {(record.retiredAt || (record as any).timestamp || new Date().toISOString()).split('T')[0].replace(/-/g, '.')}
                </div>
                <div className="w-24 h-[1px] bg-[#231E14] my-1" />
                <div className="text-[10px] uppercase font-serif text-[#6B5738]">Date</div>
              </div>

              {/* Embossed Golden Seal & Serial Box */}
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 h-16 rounded-full flex flex-col items-center justify-center p-1 border-2 border-dashed border-[#9E7724] shadow-inner"
                  style={{
                    background: 'radial-gradient(circle, #FCF8E8 30%, #E8D39E 100%)'
                  }}
                >
                  <div className="w-12 h-12 rounded-full border border-[#9E7724] flex flex-col items-center justify-center">
                    <span className="text-[7px] font-serif font-black text-[#785A23] leading-tight uppercase">Verified</span>
                    <span className="text-[6px] font-serif font-bold text-[#785A23] uppercase">Blue Carbon</span>
                    <span className="text-[5px] font-mono text-[#9E7724]">2026</span>
                  </div>
                </div>

                {/* Serial Box [ No. CERT-ID ] */}
                <div className="mt-2 px-3 py-0.5 bg-white border border-[#C5A059] rounded text-[10px] font-mono text-[#231E14] font-bold">
                  No. {record.certificateId.replace('CERT-', '')}
                </div>
              </div>

              {/* QR Code & Signature on Right */}
              <div className="flex items-center gap-3">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-12 h-12 border border-[#C5A059] p-0.5 bg-white rounded shadow-sm" />
                )}
                <div className="text-center sm:text-right">
                  <div className="font-serif italic font-bold text-sm text-[#231E14]" style={{ fontFamily: 'Great Vibes, cursive', fontSize: '18px' }}>
                    Dr. Aris Thorne
                  </div>
                  <div className="w-28 h-[1px] bg-[#231E14] my-1 sm:ml-auto" />
                  <div className="text-[10px] uppercase font-serif text-[#6B5738]">Director / Lead Auditor</div>
                </div>
              </div>

            </div>
          </div>

          {/* Ecological Equivalent Impact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <TreePine className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-emerald-950">~{treesEquiv.toLocaleString()} Mangrove Saplings</div>
                <div className="text-[11px] text-emerald-700">Estimated ecological conservation equivalent</div>
              </div>
            </div>
            <div className="p-3 bg-sky-50/70 border border-sky-200/60 rounded-xl flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-800 shrink-0">
                <PlaneTakeoff className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sky-950">~{flightsEquiv.toLocaleString()} Long-Haul Flights</div>
                <div className="text-[11px] text-sky-700">Passenger emissions equivalent offset</div>
              </div>
            </div>
          </div>

          {/* Cryptographic Ledger Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 text-[11px] block">Polygon Burn Tx Hash:</span>
              <a 
                href={`https://amoy.polygonscan.com/tx/${record.txHash}`}
                target="_blank" 
                rel="noreferrer"
                className="font-mono text-emerald-700 hover:underline truncate block mt-0.5"
              >
                {record.txHash}
              </a>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Beneficiary Wallet:</span>
              <span className="font-mono text-slate-800 truncate block mt-0.5">
                {(record as any).beneficiaryWallet || record.companyWallet || '0x000000000000000000000000000000000000dEaD'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 py-3 px-6 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Generating PDF...' : 'Download Official ESG PDF Certificate'}
            </button>

            <button
              onClick={handleCopyLink}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'Link Copied!' : 'Copy Verification URL'}</span>
            </button>

            <button
              onClick={handleOpenVerifyPage}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Public Audit View</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
