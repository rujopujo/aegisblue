import React, { useState } from 'react';
import { 
  Coins, 
  Database, 
  CheckCircle2, 
  ArrowRight, 
  FileCode, 
  Sparkles, 
  Copy, 
  Check, 
  Lock,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  LatLng, 
  SatelliteBandData, 
  CarbonAuditMetrics, 
  BoundaryCheckResult, 
  TokenizedProject, 
  IPFSMetaPayload 
} from '../types';
import { 
  createIPFSPackage, 
  mintCarbonTokens 
} from '../services/web3Registry';

interface Pillar3TokenizationProps {
  projectData: {
    name: string;
    ngoName: string;
    ngoWallet: string;
    ngoRegistrationNo: string;
    locationName: string;
    coordinates: LatLng[];
    areaHectares: number;
    boundaryResult: BoundaryCheckResult;
  };
  auditData: {
    spectralData: SatelliteBandData;
    carbonMetrics: CarbonAuditMetrics;
  };
  onTokenized: (tokenizedProject: TokenizedProject) => void;
}

export const Pillar3_Tokenization: React.FC<Pillar3TokenizationProps> = ({
  projectData,
  auditData,
  onTokenized,
}) => {
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [ipfsPayload, setIpfsPayload] = useState<IPFSMetaPayload | null>(null);
  const [tokenizedProject, setTokenizedProject] = useState<TokenizedProject | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pricePerTon, setPricePerTon] = useState<number>(32.0);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate IPFS bundle first
  const handleGenerateIPFS = () => {
    const pkg = createIPFSPackage(
      `PROJ-MGROV-${Date.now().toString().slice(-6)}`,
      projectData.name,
      projectData.ngoName,
      projectData.coordinates,
      projectData.areaHectares,
      projectData.boundaryResult.matchedGmwZone?.id || 'GMW-ZONE-IND',
      auditData.spectralData,
      auditData.carbonMetrics
    );
    setIpfsPayload(pkg);
  };

  // Execute Web3 Smart Contract Minting on Polygon Amoy
  const handleExecuteMinting = () => {
    if (!ipfsPayload) return;

    setIsMinting(true);

    setTimeout(() => {
      const minted = mintCarbonTokens({
        id: ipfsPayload.metadata.projectId,
        name: projectData.name,
        ngoName: projectData.ngoName,
        ngoWallet: projectData.ngoWallet,
        ngoRegistrationNo: projectData.ngoRegistrationNo,
        locationName: projectData.locationName,
        coordinates: projectData.coordinates,
        areaHectares: projectData.areaHectares,
        boundaryResult: projectData.boundaryResult,
        spectralData: auditData.spectralData,
        carbonMetrics: auditData.carbonMetrics,
        ipfs: ipfsPayload,
        pricePerTonUSD: pricePerTon,
      });

      setTokenizedProject(minted);
      setIsMinting(false);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#22d3ee', '#34d399'],
      });
    }, 1800);
  };

  const handleProceedToMarketplace = () => {
    if (!tokenizedProject) return;
    onTokenized(tokenizedProject);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pillar 3 Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#022c22] border border-teal-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold">
            <Coins className="w-4 h-4" />
            <span>Pillar 3: Web3 Tokenization (The "V" in MRV & Carbon Registry)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            IPFS Metadata Bundling & Smart Contract Tokenization
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Convert real-world satellite-verified carbon sequestration into liquid, fractionalized Web3 assets. Raw spectral telemetry is pinned to IPFS, and an ERC-1155 smart contract on <span className="text-teal-400 font-semibold">Polygon Amoy</span> mints exactly <span className="text-emerald-400 font-bold">1 Token per 1 Metric Ton of CO₂</span>.
          </p>
        </div>
      </div>

      {/* Main Tokenization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: IPFS Packaging & Smart Contract Parameters */}
        <div className="lg:col-span-6 space-y-6">
          {/* IPFS Packaging Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                <Database className="w-4 h-4 text-teal-400" />
                <span>1. Decentralized IPFS Metadata Bundle</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Content-Addressed Storage</span>
            </div>

            <p className="text-xs text-slate-300">
              Bundles the project GPS polygon, Sentinel-2 spectral logs, allometric equation coefficients, and SHA-256 signatures into a single unalterable payload.
            </p>

            {!ipfsPayload ? (
              <button
                onClick={handleGenerateIPFS}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-600/20 transition-all duration-200"
              >
                <Database className="w-4 h-4" />
                <span>Bundle & Pin Metadata to IPFS</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-ocean-950/90 p-4 rounded-xl border border-teal-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold text-teal-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>IPFS CID v1 (Immutable Hash):</span>
                    </span>
                    <button
                      onClick={() => handleCopy(ipfsPayload.cid, 'cid')}
                      className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px] font-mono"
                    >
                      {copiedField === 'cid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'cid' ? 'Copied' : 'Copy CID'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-teal-300 break-all bg-black/40 p-2.5 rounded border border-teal-900/40">
                    {ipfsPayload.cid}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Payload Size: {ipfsPayload.payloadSizeKb} KB</span>
                    <span>Pinned Status: Pinata / Web3.Storage Active</span>
                  </div>
                </div>

                {/* Live JSON Inspector */}
                <details className="text-xs bg-ocean-950/80 p-3 rounded-xl border border-ocean-800">
                  <summary className="cursor-pointer font-mono text-slate-300 hover:text-teal-300 flex items-center space-x-1.5">
                    <FileCode className="w-3.5 h-3.5 text-teal-400" />
                    <span>Inspect Raw IPFS JSON Metadata Payload</span>
                  </summary>
                  <pre className="mt-3 p-3 bg-black/60 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto border border-ocean-800">
                    {JSON.stringify(ipfsPayload.metadata, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Token Valuation & NGO Allocation */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>2. Token Minting Parameters & Price</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Listing Price (USD / Ton)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    value={pricePerTon}
                    onChange={(e) => setPricePerTon(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Total Valuation</label>
                <div className="py-2.5 px-3 rounded-xl bg-ocean-950 border border-ocean-800 text-emerald-400 font-mono text-xs font-bold">
                  ${(auditData.carbonMetrics.projectTotalCO2Tons * pricePerTon).toLocaleString()} USD
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-ocean-950/60 p-3 rounded-xl border border-ocean-800">
              💡 100% of the tokenized carbon credits are initially escrowed to the NGO Beneficiary Wallet (<span className="text-cyan-300 font-mono">{projectData.ngoWallet}</span>) and become unlocked upon marketplace listing.
            </div>
          </div>
        </div>

        {/* Right Column: Smart Contract Minting Engine */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel-glow p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white text-base">Polygon Amoy ERC-1155 Smart Contract</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Chain ID: 80002
              </span>
            </div>

            {/* Token Minting Summary Box */}
            <div className="bg-ocean-950/90 p-5 rounded-2xl border border-ocean-800 space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Total Tonnes Sequestered (Input):</span>
                <span className="font-mono text-emerald-400 font-bold text-sm">
                  {auditData.carbonMetrics.projectTotalCO2Tons.toLocaleString()} t CO₂
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Exact Fractionalized Tokens to Mint:</span>
                <span className="font-mono text-cyan-300 font-bold text-base">
                  {auditData.carbonMetrics.projectTotalCO2Tons.toLocaleString()} MGROV
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-ocean-850">
                <span>Backing Ratio:</span>
                <span className="font-mono text-slate-200 font-semibold">
                  1 MGROV Token = Exactly 1 Metric Ton CO₂
                </span>
              </div>
            </div>

            {!tokenizedProject ? (
              <button
                onClick={handleExecuteMinting}
                disabled={!ipfsPayload || isMinting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-ocean-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-teal-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {isMinting ? (
                  <>
                    <Cpu className="w-5 h-5 animate-spin text-ocean-950" />
                    <span>Broadcasting ERC-1155 Mint Transaction to Polygon Amoy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-ocean-950" />
                    <span>Execute Smart Contract Token Minting</span>
                  </>
                )}
              </button>
            ) : (
              /* Success State with Transaction Hash & Explorer Link */
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-500/40 space-y-2.5">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Carbon Credits Minted On-Chain Successfully!</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Token ID:</span>
                      <span className="text-cyan-300 font-bold">{tokenizedProject.tokenization.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Minted Supply:</span>
                      <span className="text-emerald-400 font-bold">
                        {tokenizedProject.tokenization.totalMinted.toLocaleString()} MGROV
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Block Number:</span>
                      <span className="text-slate-200">#{tokenizedProject.tokenization.blockNumber}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-900/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Transaction Hash:</span>
                      <button
                        onClick={() => handleCopy(tokenizedProject.tokenization.txHash, 'tx')}
                        className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px]"
                      >
                        {copiedField === 'tx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'tx' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-cyan-300 break-all bg-black/40 p-2 rounded">
                      {tokenizedProject.tokenization.txHash}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProceedToMarketplace}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30 transition-all duration-200"
                >
                  <span>Proceed to Pillar 4: B2B Enterprise Carbon Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
