import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Download,
  Copy,
  Check,
  ArrowLeft,
  Flame,
  Award,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';
import { RetirementRecord } from '../types';
import { apiVerifyCertificate } from '../services/apiClient';
import { verifyOnChainRetirement, OnChainVerificationResult, POLYGON_AMOY_CONFIG } from '../services/web3Registry';
import { generateVerificationUrl, generateQRCodeDataUrl } from '../services/qrService';
import { downloadESGCertificatePDF } from '../services/certificateGenerator';

interface VerificationPageProps {
  certificateId: string;
  onBackToApp?: () => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({
  certificateId,
  onBackToApp,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [record, setRecord] = useState<RetirementRecord | null>(null);
  const [errorStatus, setErrorStatus] = useState<'NOT_FOUND' | 'NETWORK_ERROR' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [isVerifyingOnChain, setIsVerifyingOnChain] = useState<boolean>(false);
  const [onChainResult, setOnChainResult] = useState<OnChainVerificationResult | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  // Fetch certificate verification data
  const fetchVerificationData = async () => {
    setLoading(true);
    setErrorStatus(null);
    setErrorMessage('');
    setOnChainResult(null);

    const cleanId = (certificateId || '').trim();
    if (!cleanId) {
      setErrorStatus('NOT_FOUND');
      setErrorMessage('No certificate ID specified.');
      setLoading(false);
      return;
    }

    try {
      const res = await apiVerifyCertificate(cleanId);
      if (!res.success || !res.data?.record) {
        if (res.status === 404) {
          setErrorStatus('NOT_FOUND');
          setErrorMessage(res.error || `Certificate '${cleanId}' was not found in the AegisBlue registry.`);
        } else {
          setErrorStatus('NETWORK_ERROR');
          setErrorMessage(res.error || 'Failed to connect to verification service.');
        }
        setLoading(false);
        return;
      }

      const rec = res.data.record;
      setRecord(rec);
      setLoading(false);

      // Generate verification QR code
      const verifyUrl = generateVerificationUrl(cleanId);
      generateQRCodeDataUrl(verifyUrl)
        .then(setQrDataUrl)
        .catch((err) => console.warn('[AegisBlue] QR generation error:', err));

      // Execute read-only on-chain verification if a real txHash is present
      if (rec.txHash && rec.txHash.startsWith('0x') && rec.txHash.length === 66 && rec.burnReceiptBlock > 0) {
        setIsVerifyingOnChain(true);
        try {
          const result = await verifyOnChainRetirement({
            transactionHash: rec.txHash,
            tokenId: rec.tokenId,
            amount: rec.tonsRetired,
            wallet: rec.companyWallet,
          });
          setOnChainResult(result);
        } catch (err: any) {
          setOnChainResult({
            verified: false,
            status: 'RPC_UNAVAILABLE',
            contractAddress: POLYGON_AMOY_CONFIG.contractAddress,
            transactionHash: rec.txHash,
            errorMessage: err?.message || 'Read-only RPC query timed out.',
          });
        } finally {
          setIsVerifyingOnChain(false);
        }
      }
    } catch (err: any) {
      setErrorStatus('NETWORK_ERROR');
      setErrorMessage(err?.message || 'Unexpected failure during verification query.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationData();
  }, [certificateId]);

  const handleCopyLink = () => {
    const url = generateVerificationUrl(certificateId);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!record) return;
    try {
      setIsDownloading(true);
      await downloadESGCertificatePDF(record);
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine High-Level Verification State
  const isBlockchainConfirmed = Boolean(
    onChainResult?.verified && onChainResult.status === 'VERIFIED_ON_CHAIN'
  );
  const isRpcUnavailable = Boolean(
    !isBlockchainConfirmed && onChainResult?.status === 'RPC_UNAVAILABLE'
  );
  const isOffChainRecord = Boolean(
    record && (!record.txHash || record.burnReceiptBlock === 0)
  );

  return (
    <div className="min-h-screen bg-[#050B18] text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Brand Header */}
      <header className="border-b border-ocean-800 bg-[#070f26]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-ocean-950 font-bold" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white flex items-center space-x-2">
                <span>AEGISBLUE</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Verification Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Decentralized Blue Carbon Digital MRV & Proof-of-Burn Explorer
              </p>
            </div>
          </div>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-ocean-900 hover:bg-ocean-800 text-slate-300 hover:text-white text-xs font-semibold border border-ocean-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Registry</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-8 animate-fadeIn">
        {/* Loading State */}
        {loading && (
          <div className="p-16 rounded-3xl bg-ocean-950/70 border border-ocean-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-spin">
              <RefreshCw className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white">Validating Certificate Identifier</h2>
            <p className="text-xs text-slate-400 font-mono">
              Querying AegisBlue immutable database & checking Polygon Amoy on-chain burn events...
            </p>
          </div>
        )}

        {/* 404 / Error State */}
        {!loading && errorStatus && (
          <div className="p-10 sm:p-14 rounded-3xl bg-red-950/30 border-2 border-red-500/40 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
              <XCircle className="w-9 h-9" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-black text-white">
                {errorStatus === 'NOT_FOUND' ? 'Certificate Not Found' : 'Verification Service Unreachable'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {errorMessage}
              </p>
              <p className="text-xs font-mono text-slate-400 pt-2">
                Searched ID: <span className="text-cyan-300 font-bold">{certificateId}</span>
              </p>
            </div>

            <div className="pt-4 flex justify-center space-x-3">
              <button
                onClick={fetchVerificationData}
                className="px-5 py-2.5 rounded-xl bg-ocean-900 hover:bg-ocean-800 text-slate-200 text-xs font-semibold flex items-center space-x-2 border border-ocean-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Search</span>
              </button>
              {onBackToApp && (
                <button
                  onClick={onBackToApp}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold transition-all"
                >
                  Return to Main Registry
                </button>
              )}
            </div>
          </div>
        )}

        {/* Successful Certificate Loaded */}
        {!loading && record && (
          <div className="space-y-6">
            {/* Live On-Chain Verification Progress */}
            {isVerifyingOnChain && (
              <div className="p-6 rounded-3xl bg-cyan-950/40 border-2 border-cyan-500/40 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      VERIFYING ON-CHAIN RECEIPT ON POLYGON AMOY...
                    </h2>
                    <p className="text-xs text-cyan-200/80 mt-0.5 font-mono">
                      Querying RPC node, verifying ERC-1155 burn logs, and decoding CarbonCreditsRetired event...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Verification Banner */}
            {!isVerifyingOnChain && isBlockchainConfirmed && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-[#062419] to-teal-950/80 border-2 border-emerald-500/60 shadow-2xl shadow-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest text-emerald-400 uppercase font-mono">
                      Cryptographic Burn Proven
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      VERIFIED ON POLYGON AMOY
                    </h1>
                    <p className="text-xs text-emerald-200/80 mt-1">
                      ERC-1155 tokens burned on POS consensus • Confirmation Block #{onChainResult?.blockNumber?.toLocaleString()} • {onChainResult?.confirmations} Confirmations
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center space-x-2">
                  <a
                    href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${record.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center space-x-1.5 border border-emerald-500/40 transition-colors"
                  >
                    <span>PolygonScan Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {isRpcUnavailable && (
              <div className="p-6 rounded-3xl bg-amber-950/40 border-2 border-amber-500/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      RECORD FOUND — BLOCKCHAIN RPC TEMPORARILY UNAVAILABLE
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Certificate is registered in the authoritative database with burn transaction hash{' '}
                      <span className="font-mono text-cyan-300">{record.txHash.slice(0, 16)}...</span>.
                      Live RPC validation timed out. View directly on block explorer below.
                    </p>
                  </div>
                </div>
                <a
                  href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${record.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs flex items-center space-x-1 border border-amber-500/40 transition-colors shrink-0"
                >
                  <span>Verify on PolygonScan</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {isOffChainRecord && (
              <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      OFF-CHAIN RECORD (LEGACY / SIMULATION)
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      This certificate exists in the historical registry database but does not represent a confirmed on-chain Polygon Amoy ERC-1155 burn.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Off-Chain Ledger
                </span>
              </div>
            )}

            {/* Certificate Dossier Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main 2-Column Detail Panel */}
              <div className="lg:col-span-2 rounded-3xl bg-ocean-950/80 border border-ocean-800 p-6 sm:p-8 space-y-6">
                <div className="border-b border-ocean-800 pb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Certificate Identifier
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                      {record.certificateId}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Retirement Date
                    </span>
                    <div className="text-xs text-slate-200 font-mono">
                      {new Date(record.retiredAt).toUTCString()}
                    </div>
                  </div>
                </div>

                {/* Tons & Beneficiary Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Verified Carbon Volume
                    </div>
                    <div className="text-3xl font-black text-emerald-300 font-mono flex items-baseline space-x-1">
                      <span>{record.tonsRetired.toLocaleString()}</span>
                      <span className="text-sm font-normal text-emerald-400">t CO₂e</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Flame className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Irrevocably burned</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-1">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Beneficiary Entity
                    </div>
                    <div className="text-lg font-bold text-white truncate" title={record.companyName}>
                      {record.companyName}
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300 truncate" title={record.companyWallet}>
                      {record.companyWallet}
                    </div>
                  </div>
                </div>

                {/* Granular Metadata Table */}
                <div className="space-y-3 pt-2 text-xs font-mono">
                  <div className="flex justify-between py-2 border-b border-ocean-900">
                    <span className="text-slate-400">Project Name:</span>
                    <span className="text-white font-bold">{record.projectName}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-ocean-900">
                    <span className="text-slate-400">Project ID:</span>
                    <span className="text-cyan-300">{record.projectId}</span>
                  </div>

                  {record.tokenId && (
                    <div className="flex justify-between py-2 border-b border-ocean-900">
                      <span className="text-slate-400">ERC-1155 Token ID:</span>
                      <span className="text-teal-300 truncate max-w-[260px]" title={record.tokenId}>
                        {record.tokenId}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 border-b border-ocean-900">
                    <span className="text-slate-400">Retirement Purpose:</span>
                    <span className="text-slate-200 text-right max-w-[320px]">{record.purpose}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-ocean-900">
                    <span className="text-slate-400">Network:</span>
                    <span className="text-emerald-400 font-bold">Polygon Amoy Testnet (#80002)</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-ocean-900">
                    <span className="text-slate-400">Contract Address:</span>
                    <a
                      href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>{POLYGON_AMOY_CONFIG.contractAddress.slice(0, 16)}...</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="flex justify-between py-2 border-b border-ocean-900">
                    <span className="text-slate-400">Transaction Hash:</span>
                    {record.txHash ? (
                      <a
                        href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${record.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center space-x-1"
                      >
                        <span>{record.txHash.slice(0, 18)}...</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-slate-500">Off-Chain Record</span>
                    )}
                  </div>

                  <div className="flex justify-between py-2 border-b border-ocean-900">
                    <span className="text-slate-400">Polygon Block:</span>
                    <span className="text-slate-200">
                      {record.burnReceiptBlock > 0 ? `#${record.burnReceiptBlock.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>

                  {record.ipfsCertificateCid && (
                    <div className="flex justify-between py-2 border-b border-ocean-900">
                      <span className="text-slate-400">IPFS Audit Dossier:</span>
                      <span className="text-teal-300 font-mono text-[11px] truncate max-w-[260px]">
                        {record.ipfsCertificateCid}
                      </span>
                    </div>
                  )}
                </div>

                {/* Decoded On-Chain Event Proof Sub-Card */}
                {isBlockchainConfirmed && onChainResult?.eventDetails && (
                  <div className="p-4 rounded-2xl bg-ocean-900/60 border border-emerald-500/30 space-y-2 text-xs font-mono">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <Layers className="w-4 h-4" />
                      <span>Decoded Smart Contract Event: CarbonCreditsRetired</span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1 pl-6">
                      <div>account: <span className="text-cyan-300">{onChainResult.eventDetails.account}</span></div>
                      <div>tokenId: <span className="text-teal-300">{onChainResult.eventDetails.tokenId}</span></div>
                      <div>amount: <span className="text-emerald-400 font-bold">{onChainResult.eventDetails.amount} tons</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side Action / QR Card */}
              <div className="space-y-6">
                {/* QR Code Container Card */}
                <div className="rounded-3xl bg-ocean-950/80 border border-ocean-800 p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span>Public Verification QR</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-emerald-400/40">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="AegisBlue Public Verification QR"
                        className="w-44 h-44 object-contain"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-400">
                      Scan to verify this certificate.
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono break-all max-w-[220px]">
                      {generateVerificationUrl(certificateId)}
                    </p>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="w-full py-2.5 rounded-xl bg-ocean-900 hover:bg-ocean-850 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 border border-ocean-700 transition-colors"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{isCopied ? 'Link Copied to Clipboard' : 'Copy Verification Link'}</span>
                  </button>
                </div>

                {/* PDF Certificate Download Card */}
                <div className="rounded-3xl bg-gradient-to-b from-ocean-900 to-ocean-950 border border-ocean-800 p-6 space-y-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-white">
                    Official Documentation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Download the high-resolution landscape PDF certificate containing institutional seal, satellite MRV coordinates, and embedded QR verification code.
                  </p>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-ocean-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Generating PDF...' : 'Download Official PDF'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-ocean-900 bg-[#030712] py-6 px-4 text-center text-xs text-slate-400 font-mono">
        <div>AegisBlue Decentralized Registry • Polygon Amoy Smart Contract 0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9</div>
        <div className="text-[10px] text-slate-400 mt-1">
          Zero-Greenwashing Proof-of-Burn • Global Mangrove Watch v3.0 Spatial Gatekeeper
        </div>
      </footer>
    </div>
  );
};
