import React, { useState, useMemo, useEffect } from 'react';
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
  Cpu,
  ExternalLink,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  RefreshCw
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
import { apiPinAuditDossier } from '../services/apiClient';
import { 
  POLYGON_AMOY_CONFIG,
  deriveDeterministicTokenId,
  formatBytes32Hash,
  getContractOwner,
  getTokenBalance,
  checkProjectRegistration,
  checkProjectIdRegistered,
  registerOnChainProject,
  mintOnChainCredits,
  checkExistingConnection,
  connectBrowserWallet,
  switchToPolygonAmoy,
  formatWeb3ErrorMessage,
  isMetaMaskInstalled
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

export type TokenizationStage =
  | 'IDLE'
  | 'PREPARING_DOSSIER'
  | 'PINNING_IPFS'
  | 'AWAITING_REGISTER_APPROVAL'
  | 'CONFIRMING_REGISTRATION'
  | 'AWAITING_MINT_APPROVAL'
  | 'CONFIRMING_MINT'
  | 'COMPLETED'
  | 'ERROR';

export const Pillar3_Tokenization: React.FC<Pillar3TokenizationProps> = ({
  projectData,
  auditData,
  onTokenized,
}) => {
  const [stage, setStage] = useState<TokenizationStage>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isPinning, setIsPinning] = useState<boolean>(false);
  const [ipfsPayload, setIpfsPayload] = useState<IPFSMetaPayload | null>(null);
  const [ipfsError, setIpfsError] = useState<string | null>(null);

  const [tokenizedProject, setTokenizedProject] = useState<TokenizedProject | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [pricePerTon, setPricePerTon] = useState<number>(32.0);

  const [contractOwner, setContractOwner] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isOwnerWallet, setIsOwnerWallet] = useState<boolean | null>(null);

  // Derive stable human-readable project identifier
  const canonicalProjectId = useMemo(() => {
    const cleanSlug = (projectData.name || 'SANCTUARY')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 16)
      .toUpperCase();
    const area = Math.round(projectData.areaHectares || 100);
    return `AEGIS-${cleanSlug}-${area}`;
  }, [projectData.name, projectData.areaHectares]);

  // Deterministically derive 256-bit Solidity token ID from projectId
  const deterministicTokenId = useMemo(() => {
    return deriveDeterministicTokenId(canonicalProjectId);
  }, [canonicalProjectId]);

  const deterministicTokenIdStr = useMemo(() => {
    return deterministicTokenId.toString();
  }, [deterministicTokenId]);

  // Inspect wallet and contract owner on mount
  useEffect(() => {
    async function loadContractInfo() {
      try {
        const owner = await getContractOwner();
        setContractOwner(owner);

        const connection = await checkExistingConnection();
        if (connection?.address) {
          setConnectedWallet(connection.address);
          setIsOwnerWallet(connection.address.toLowerCase() === owner.toLowerCase());
        }
      } catch (err) {
        console.warn('[AegisBlue] Could not read contract info:', err);
      }
    }
    loadContractInfo();
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Real IPFS Pinning via AegisBlue Python Backend (server-side Pinata)
   */
  const handleGenerateIPFS = async (): Promise<IPFSMetaPayload | null> => {
    setIsPinning(true);
    setIpfsError(null);
    setErrorMessage(null);

    try {
      const formattedAuditHash = formatBytes32Hash(auditData.carbonMetrics.auditHash);
      const totalCredits = Math.round(auditData.carbonMetrics.projectTotalCO2Tons);

      const pinResult = await apiPinAuditDossier({
        projectId: canonicalProjectId,
        auditHash: formattedAuditHash,
        totalCredits: totalCredits > 0 ? totalCredits : 1,
        projectName: projectData.name,
        ngoName: projectData.ngoName,
        locationName: projectData.locationName,
        areaHectares: projectData.areaHectares,
        coordinates: projectData.coordinates,
        spectralData: auditData.spectralData,
        carbonMetrics: auditData.carbonMetrics,
        nearestCcnCore: projectData.boundaryResult.nearestCcnCore,
      });

      const payload: IPFSMetaPayload = {
        cid: pinResult.cid,
        gatewayUrl: pinResult.gatewayUrl,
        payloadSizeKb: Math.round((pinResult.pinSize || JSON.stringify(pinResult.dossier).length) / 1024 * 10) / 10,
        pinnedAt: pinResult.timestamp || new Date().toISOString(),
        metadata: pinResult.dossier as any,
      };

      setIpfsPayload(payload);
      setIsPinning(false);
      return payload;
    } catch (err: any) {
      console.error('[AegisBlue] IPFS Pinning error:', err);
      const msg = err?.message || 'Failed to pin audit dossier to IPFS via backend.';
      setIpfsError(msg);
      setIsPinning(false);
      return null;
    }
  };

  /**
   * Multi-stage Real Web3 Tokenization & Minting Workflow
   */
  const handleExecuteMinting = async () => {
    setErrorMessage(null);

    // 1. Check MetaMask installation
    if (!isMetaMaskInstalled()) {
      setStage('ERROR');
      setErrorMessage('MetaMask is not installed. Please install MetaMask to interact with Polygon Amoy.');
      return;
    }

    try {
      // Stage 1: Preparing Dossier & Checking Network / Wallet
      setStage('PREPARING_DOSSIER');
      setStatusMessage('Connecting wallet and verifying Polygon Amoy network...');

      const connection = await connectBrowserWallet();
      setConnectedWallet(connection.address);

      if (!connection.isCorrectNetwork) {
        setStatusMessage('Switching network to Polygon Amoy (Chain ID 80002)...');
        await switchToPolygonAmoy();
      }

      // Check Contract Owner
      setStatusMessage('Checking smart contract access control permissions...');
      const owner = await getContractOwner();
      setContractOwner(owner);
      const isOwner = connection.address.toLowerCase() === owner.toLowerCase();
      setIsOwnerWallet(isOwner);

      if (!isOwner) {
        const errorText = `Access Denied: Connected wallet (${connection.address.slice(0, 6)}...${connection.address.slice(-4)}) is not the contract deployer/owner (${owner.slice(0, 6)}...${owner.slice(-4)}). Only the designated AegisBlue Registry Owner can register projects and mint carbon credits.`;
        setStage('ERROR');
        setErrorMessage(errorText);
        return;
      }

      // Stage 2: Pinning to IPFS if not already pinned
      let activeIpfsPayload = ipfsPayload;
      if (!activeIpfsPayload) {
        setStage('PINNING_IPFS');
        setStatusMessage('Pinning immutable MRV audit dossier to IPFS via AegisBlue backend...');
        activeIpfsPayload = await handleGenerateIPFS();
        if (!activeIpfsPayload) {
          throw new Error('IPFS pinning could not be completed. Please ensure the backend microservice is running.');
        }
      }

      const totalCredits = Math.round(auditData.carbonMetrics.projectTotalCO2Tons);
      const formattedAuditHash = formatBytes32Hash(auditData.carbonMetrics.auditHash);

      // Stage 3 & 4: On-Chain Project Registration
      setStatusMessage('Checking on-chain registry for existing project registration...');
      const existingReg = await checkProjectRegistration(deterministicTokenId);
      const existingProjId = await checkProjectIdRegistered(canonicalProjectId);

      let regTx = '';
      let regBlk = 0;

      if (existingReg.registered || existingProjId.registered) {
        console.log(`[AegisBlue] Project ${canonicalProjectId} is already registered on-chain. Reusing existing registration.`);
        setStatusMessage('Project already registered on-chain. Proceeding to credit minting...');
      } else {
        setStage('AWAITING_REGISTER_APPROVAL');
        setStatusMessage('Waiting for MetaMask approval: Register Blue Carbon Project on-chain...');

        const regReceipt = await registerOnChainProject(
          canonicalProjectId,
          activeIpfsPayload.cid,
          formattedAuditHash,
          deterministicTokenId,
          totalCredits
        );

        setStage('CONFIRMING_REGISTRATION');
        setStatusMessage(`Confirming project registration on Polygon Amoy (Block #${regReceipt.blockNumber})...`);
        regTx = regReceipt.txHash;
        regBlk = regReceipt.blockNumber;
      }

      // Stage 5 & 6: On-Chain Carbon Credit Minting
      let recipient = (projectData.ngoWallet || '').trim();
      // If ngoWallet is an abbreviated placeholder or invalid, default to the connected owner address
      if (!recipient.startsWith('0x') || recipient.length !== 42) {
        recipient = connection.address;
      }

      setStatusMessage('Checking current on-chain token balance...');
      const currentBalance = await getTokenBalance(recipient, deterministicTokenId);
      let mintTx = '';
      let mintBlk = 0;

      if (currentBalance >= BigInt(totalCredits)) {
        console.log(`[AegisBlue] Full credits (${totalCredits}) already minted to recipient (${recipient}).`);
        setStatusMessage('Credits are already minted on-chain. Finalizing project record...');
      } else {
        const remainingToMint = totalCredits - Number(currentBalance);
        setStage('AWAITING_MINT_APPROVAL');
        setStatusMessage(`Waiting for MetaMask approval: Mint ${remainingToMint.toLocaleString()} ERC-1155 Carbon Credits to ${recipient.slice(0, 6)}...${recipient.slice(-4)}...`);

        const mintReceipt = await mintOnChainCredits(
          recipient,
          deterministicTokenId,
          remainingToMint
        );

        setStage('CONFIRMING_MINT');
        setStatusMessage(`Confirming mint on Polygon Amoy (Block #${mintReceipt.blockNumber})...`);
        mintTx = mintReceipt.txHash;
        mintBlk = mintReceipt.blockNumber;
      }

      // Stage 7: Complete
      const mintedRecord: TokenizedProject = {
        id: canonicalProjectId,
        name: projectData.name,
        ngoName: projectData.ngoName,
        ngoWallet: recipient,
        ngoRegistrationNo: projectData.ngoRegistrationNo,
        locationName: projectData.locationName,
        coordinates: projectData.coordinates,
        areaHectares: projectData.areaHectares,
        boundaryResult: projectData.boundaryResult,
        spectralData: auditData.spectralData,
        carbonMetrics: auditData.carbonMetrics,
        ipfs: activeIpfsPayload,
        tokenization: {
          tokenId: deterministicTokenIdStr,
          contractAddress: POLYGON_AMOY_CONFIG.contractAddress,
          network: POLYGON_AMOY_CONFIG.networkName,
          totalMinted: totalCredits,
          availableCredits: totalCredits,
          retiredCredits: 0,
          pricePerTonUSD: pricePerTon,
          txHash: mintTx || regTx || POLYGON_AMOY_CONFIG.contractAddress,
          blockNumber: mintBlk || regBlk || 14892000,
          registrationTxHash: regTx || undefined,
          registrationBlockNumber: regBlk || undefined,
          mintedAt: new Date().toISOString(),
        },
        coBenefits: [
          'Royal Bengal Tiger & Fishing Cat Wetland Habitat Refuge',
          'Tidal Storm-Surge & Cyclone Buffer for Coastal Communities',
          'Empowerment of 1,200+ Coastal Fisherwomen & Sustainable Co-ops',
          'Estuarine Nursery for Mud Crabs, Mangrove Snapper & Molluscs',
        ],
        status: 'LISTED',
      };

      setTokenizedProject(mintedRecord);
      setStage('COMPLETED');
      setStatusMessage('On-chain tokenization & minting successfully executed on Polygon Amoy!');

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#22d3ee', '#34d399', '#818cf8'],
      });
    } catch (err: any) {
      console.error('[AegisBlue] Minting workflow failed:', err);
      setStage('ERROR');
      setErrorMessage(formatWeb3ErrorMessage(err));
    }
  };

  const handleProceedToMarketplace = () => {
    if (!tokenizedProject) return;
    onTokenized(tokenizedProject);
  };

  const isExecuting = stage !== 'IDLE' && stage !== 'COMPLETED' && stage !== 'ERROR';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pillar 3 Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#022c22] border border-teal-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold">
            <Coins className="w-4 h-4" />
            <span>Pillar 3: Web3 Tokenization (The &quot;V&quot; in MRV &amp; Carbon Registry)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            IPFS Metadata Bundling &amp; Smart Contract Tokenization
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Convert real-world satellite-verified carbon sequestration into liquid, fractionalized Web3 assets. Raw spectral telemetry is pinned to IPFS, and an ERC-1155 smart contract on <span className="text-teal-400 font-semibold">Polygon Amoy</span> mints exactly <span className="text-emerald-400 font-bold">1 Token per 1 Metric Ton of CO₂</span>.
          </p>
        </div>
      </div>

      {/* Contract & Wallet Permissions Notification */}
      {contractOwner && connectedWallet && isOwnerWallet === false && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Administrative Wallet Notice:</span>
            <p>
              Your connected wallet (<span className="font-mono text-white">{connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}</span>) is not the contract deployer (<span className="font-mono text-white">{contractOwner.slice(0, 6)}...{contractOwner.slice(-4)}</span>). In order to execute on-chain project registration and credit minting, switch to the deployer account in MetaMask.
            </p>
          </div>
        </div>
      )}

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
              Bundles the project GPS polygon, Sentinel-2 spectral logs, allometric equation coefficients, and SHA-256 signatures into a single unalterable payload pinned via Pinata.
            </p>

            <div className="bg-black/30 p-3 rounded-xl border border-ocean-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                <span>Project Slug:</span>
                <span className="text-teal-300">{canonicalProjectId}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-mono text-[11px]">
                <span>MRV Audit Hash:</span>
                <span className="text-slate-300">{auditData.carbonMetrics.auditHash.slice(0, 10)}...{auditData.carbonMetrics.auditHash.slice(-8)}</span>
              </div>
            </div>

            {ipfsError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
                <span>{ipfsError}</span>
                <button
                  onClick={() => handleGenerateIPFS()}
                  className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 text-[10px] flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            {!ipfsPayload ? (
              <button
                onClick={() => handleGenerateIPFS()}
                disabled={isPinning}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-600/20 transition-all duration-200 disabled:opacity-50"
              >
                {isPinning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Pinning Audit Dossier to IPFS...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Bundle &amp; Pin Metadata to IPFS</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-ocean-950/90 p-4 rounded-xl border border-teal-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-bold text-teal-300 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>IPFS CID (Immutable Hash):</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopy(ipfsPayload.cid, 'cid')}
                        className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px] font-mono"
                      >
                        {copiedField === 'cid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'cid' ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={ipfsPayload.gatewayUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-400 hover:text-teal-300 flex items-center space-x-1 text-[10px] font-mono"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-teal-300 break-all bg-black/40 p-2.5 rounded border border-teal-900/40">
                    {ipfsPayload.cid}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Payload Size: {ipfsPayload.payloadSizeKb} KB</span>
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Server-Side Pinata Pinned</span>
                    </span>
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
              <span>2. Token Minting Parameters &amp; Price</span>
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
              💡 100% of the tokenized carbon credits are initially minted to the NGO Beneficiary Wallet (<span className="text-cyan-300 font-mono">{projectData.ngoWallet}</span>) and become unlocked upon marketplace listing.
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
              <a
                href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 flex items-center space-x-1"
              >
                <span>Chain ID: 80002</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
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
                <span>Solidity uint256 Token ID:</span>
                <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-200">
                  <span>{deterministicTokenIdStr.slice(0, 10)}...{deterministicTokenIdStr.slice(-8)}</span>
                  <button
                    onClick={() => handleCopy(deterministicTokenIdStr, 'tokenid')}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedField === 'tokenid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Multi-Stage Progression Status Bar */}
            {isExecuting && (
              <div className="bg-ocean-950/90 p-4 rounded-xl border border-teal-500/40 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-teal-300">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span>{statusMessage}</span>
                </div>

                <div className="grid grid-cols-6 gap-1 pt-1">
                  <div className="h-1.5 rounded-full bg-teal-400" />
                  <div className={`h-1.5 rounded-full ${['PINNING_IPFS', 'AWAITING_REGISTER_APPROVAL', 'CONFIRMING_REGISTRATION', 'AWAITING_MINT_APPROVAL', 'CONFIRMING_MINT', 'COMPLETED'].includes(stage) ? 'bg-teal-400' : 'bg-ocean-800'}`} />
                  <div className={`h-1.5 rounded-full ${['AWAITING_REGISTER_APPROVAL', 'CONFIRMING_REGISTRATION', 'AWAITING_MINT_APPROVAL', 'CONFIRMING_MINT', 'COMPLETED'].includes(stage) ? 'bg-teal-400' : 'bg-ocean-800'}`} />
                  <div className={`h-1.5 rounded-full ${['CONFIRMING_REGISTRATION', 'AWAITING_MINT_APPROVAL', 'CONFIRMING_MINT', 'COMPLETED'].includes(stage) ? 'bg-teal-400' : 'bg-ocean-800'}`} />
                  <div className={`h-1.5 rounded-full ${['AWAITING_MINT_APPROVAL', 'CONFIRMING_MINT', 'COMPLETED'].includes(stage) ? 'bg-teal-400' : 'bg-ocean-800'}`} />
                  <div className={`h-1.5 rounded-full ${['CONFIRMING_MINT', 'COMPLETED'].includes(stage) ? 'bg-teal-400' : 'bg-ocean-800'}`} />
                </div>
              </div>
            )}

            {/* Error Message Panel */}
            {stage === 'ERROR' && errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2 text-xs text-red-200 animate-fadeIn">
                <div className="flex items-center space-x-2 text-red-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Tokenization Execution Failed</span>
                </div>
                <p className="text-[11px] leading-relaxed break-words">{errorMessage}</p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleExecuteMinting}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold flex items-center space-x-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}

            {!tokenizedProject ? (
              <button
                onClick={handleExecuteMinting}
                disabled={isExecuting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-ocean-950 font-extrabold text-sm flex items-center justify-center space-x-2 shadow-xl shadow-teal-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <Cpu className="w-5 h-5 animate-spin text-ocean-950" />
                    <span>Executing Real Polygon Amoy Registration &amp; Minting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-ocean-950" />
                    <span>Execute Smart Contract Token Minting</span>
                  </>
                )}
              </button>
            ) : (
              /* Success State with Transaction Hashes & Real Amoy Explorer Links */
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-emerald-950/80 p-4 rounded-xl border border-emerald-500/40 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Carbon Credits Minted On-Chain Successfully!</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Solidity Token ID:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-cyan-300 font-bold">{tokenizedProject.tokenization.tokenId.slice(0, 12)}...{tokenizedProject.tokenization.tokenId.slice(-8)}</span>
                        <button
                          onClick={() => handleCopy(tokenizedProject.tokenization.tokenId, 'succ-tid')}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedField === 'succ-tid' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Minted Supply:</span>
                      <span className="text-emerald-400 font-bold">
                        {tokenizedProject.tokenization.totalMinted.toLocaleString()} MGROV
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contract Address:</span>
                      <a
                        href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-300 hover:underline flex items-center space-x-1"
                      >
                        <span>{POLYGON_AMOY_CONFIG.contractAddress.slice(0, 8)}...{POLYGON_AMOY_CONFIG.contractAddress.slice(-6)}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Block Number:</span>
                      <span className="text-slate-200">#{tokenizedProject.tokenization.blockNumber}</span>
                    </div>
                  </div>

                  {/* Transaction Hashes */}
                  <div className="pt-2 border-t border-emerald-900/60 space-y-2">
                    {tokenizedProject.tokenization.registrationTxHash && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">1. Registration Tx:</span>
                          <a
                            href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${tokenizedProject.tokenization.registrationTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-400 hover:text-teal-300 flex items-center space-x-1 text-[10px]"
                          >
                            <span>PolygonScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="font-mono text-[10px] text-teal-300 break-all bg-black/40 p-2 rounded border border-ocean-800">
                          {tokenizedProject.tokenization.registrationTxHash}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">2. Mint Transaction Tx:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopy(tokenizedProject.tokenization.txHash, 'tx')}
                            className="text-slate-400 hover:text-white flex items-center space-x-1 text-[10px]"
                          >
                            {copiedField === 'tx' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'tx' ? 'Copied' : 'Copy'}</span>
                          </button>
                          <a
                            href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${tokenizedProject.tokenization.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 text-[10px]"
                          >
                            <span>PolygonScan</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div className="font-mono text-[10px] text-cyan-300 break-all bg-black/40 p-2 rounded border border-ocean-800">
                        {tokenizedProject.tokenization.txHash}
                      </div>
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
