import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShoppingBag, 
  Flame, 
  ShieldCheck, 
  Search, 
  Award,
  MapPin,
  Send,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { isAddress } from 'ethers';
import { TokenizedProject, RetirementRecord } from '../types';
import { apiRetireCredits, apiSyncRetirement, RetireCreditsPayload } from '../services/apiClient';
import { 
  POLYGON_AMOY_CONFIG,
  getTokenBalance,
  transferOnChainCredits,
  retireOnChainCredits,
  formatWeb3ErrorMessage,
  deriveDeterministicTokenId,
  getConnectedWalletAddress
} from '../services/web3Registry';


interface Pillar4MarketplaceProps {
  projects: TokenizedProject[];
  onRetireCredits: (updatedProject: TokenizedProject, record: RetirementRecord) => void;
  onOpenCertificate: (record: RetirementRecord) => void;
  defaultCompanyWallet: string;
}

const PICHAVARAM_CANONICAL = {
  projectId: 'AEGIS-PICHAVARAMESTUAR-180',
  tokenId: '7300511014531487208209184491691875089324748676569431105539752191596868391902',
  totalCredits: 100,
};

function resolveProjectTokenId(project: TokenizedProject): bigint {
  if (
    project.id === PICHAVARAM_CANONICAL.projectId ||
    project.name.toLowerCase().includes('pichavaram')
  ) {
    return BigInt(PICHAVARAM_CANONICAL.tokenId);
  }
  if (project.tokenization?.tokenId && /^\d+$/.test(project.tokenization.tokenId)) {
    return BigInt(project.tokenization.tokenId);
  }
  return deriveDeterministicTokenId(project.id);
}

export const Pillar4_Marketplace: React.FC<Pillar4MarketplaceProps> = ({
  projects,
  onRetireCredits,
  onOpenCertificate,
  defaultCompanyWallet,
}) => {
  // Live on-chain balance state (keyed by project ID)
  const [onChainBalances, setOnChainBalances] = useState<Record<string, bigint>>({});
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(false);
  const [activeWallet, setActiveWallet] = useState<string>(defaultCompanyWallet || '');

  // Direct Transfer Modal State
  const [transferProject, setTransferProject] = useState<TokenizedProject | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<number>(1);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferStage, setTransferStage] = useState<'IDLE' | 'METAMASK' | 'CONFIRMING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [transferTxHash, setTransferTxHash] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Retirement / Burn Modal State
  const [selectedProject, setSelectedProject] = useState<TokenizedProject | null>(null);
  const [retireAmount, setRetireAmount] = useState<number>(1);
  const [companyName, setCompanyName] = useState<string>('Tata Consultancy Services - NetZero FY26');
  const [companyWallet, setCompanyWallet] = useState<string>(defaultCompanyWallet || '');
  const [purpose, setPurpose] = useState<string>('Scope 1 & 2 Emissions Neutralization for Cloud Data Centers');
  const [isRetiring, setIsRetiring] = useState<boolean>(false);
  const [retireStage, setRetireStage] = useState<'IDLE' | 'METAMASK' | 'CONFIRMING' | 'SYNCING' | 'SUCCESS' | 'SYNC_FAILED' | 'ERROR'>('IDLE');
  const [retireTxHash, setRetireTxHash] = useState<string | null>(null);
  const [retireBlockNumber, setRetireBlockNumber] = useState<number | null>(null);
  const [retireError, setRetireError] = useState<string | null>(null);
  const [pendingSyncPayload, setPendingSyncPayload] = useState<RetireCreditsPayload | null>(null);
  const [isRetryingSync, setIsRetryingSync] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync active wallet with prop changes or live browser provider
  useEffect(() => {
    if (defaultCompanyWallet) {
      setActiveWallet(defaultCompanyWallet);
      setCompanyWallet(defaultCompanyWallet);
    } else {
      getConnectedWalletAddress().then((addr) => {
        if (addr) {
          setActiveWallet(addr);
          setCompanyWallet(addr);
        }
      });
    }
  }, [defaultCompanyWallet]);

  // Fetch actual on-chain ERC-1155 balances from Polygon Amoy
  const fetchAllBalances = useCallback(async () => {
    const walletToQuery = activeWallet || (await getConnectedWalletAddress());
    if (!walletToQuery || !isAddress(walletToQuery)) {
      setOnChainBalances({});
      return;
    }

    setIsLoadingBalances(true);
    const newBalances: Record<string, bigint> = {};

    try {
      await Promise.all(
        projects.map(async (p) => {
          try {
            const tid = resolveProjectTokenId(p);
            const bal = await getTokenBalance(walletToQuery, tid);
            newBalances[p.id] = bal;
          } catch (_err) {
            newBalances[p.id] = 0n;
          }
        })
      );
      setOnChainBalances(newBalances);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [projects, activeWallet]);

  useEffect(() => {
    fetchAllBalances();
  }, [fetchAllBalances]);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.ngoName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ----------------------------------------------------
  // DIRECT TRANSFER MODAL HANDLERS
  // ----------------------------------------------------
  const handleOpenTransferModal = (project: TokenizedProject) => {
    setTransferProject(project);
    setRecipientAddress('');
    const userBal = Number(onChainBalances[project.id] || 0n);
    setTransferAmount(userBal > 0 ? 1 : 0);
    setTransferStage('IDLE');
    setTransferTxHash(null);
    setTransferError(null);
    setIsTransferring(false);
  };

  const handleCloseTransferModal = () => {
    if (isTransferring) return;
    setTransferProject(null);
    setTransferStage('IDLE');
    setTransferTxHash(null);
    setTransferError(null);
  };

  const handleExecuteDirectTransfer = async () => {
    if (!transferProject) return;

    const cleanRecipient = recipientAddress.trim();
    if (!isAddress(cleanRecipient)) {
      setTransferError('Please enter a valid 42-character Ethereum address for the recipient.');
      return;
    }

    if (cleanRecipient.toLowerCase() === '0x0000000000000000000000000000000000000000') {
      setTransferError('Cannot transfer to zero address. Use the retirement flow to permanently burn tokens.');
      return;
    }

    const currentBal = onChainBalances[transferProject.id] || 0n;
    const amountBig = BigInt(Math.round(transferAmount));

    if (amountBig <= 0n) {
      setTransferError('Transfer amount must be greater than zero.');
      return;
    }

    if (amountBig > currentBal) {
      setTransferError(`Cannot transfer ${amountBig.toString()} credits. Your wallet holds ${currentBal.toString()} credits.`);
      return;
    }

    setTransferError(null);
    setIsTransferring(true);
    setTransferStage('METAMASK');

    try {
      const tokenId = resolveProjectTokenId(transferProject);
      setTransferStage('CONFIRMING');
      const { txHash } = await transferOnChainCredits(cleanRecipient, tokenId, amountBig);

      setTransferTxHash(txHash);
      setTransferStage('SUCCESS');
      setIsTransferring(false);

      // Refresh on-chain balance immediately
      await fetchAllBalances();
    } catch (err: any) {
      setTransferError(formatWeb3ErrorMessage(err));
      setTransferStage('ERROR');
      setIsTransferring(false);
    }
  };

  // ----------------------------------------------------
  // RETIREMENT (BURN) MODAL HANDLERS
  // ----------------------------------------------------
  const handleOpenRetireModal = (project: TokenizedProject) => {
    setSelectedProject(project);
    const userBal = Number(onChainBalances[project.id] || 0n);
    setRetireAmount(userBal > 0 ? Math.min(5, userBal) : 1);
    setRetireStage('IDLE');
    setRetireTxHash(null);
    setRetireBlockNumber(null);
    setRetireError(null);
    setPendingSyncPayload(null);
    setIsRetiring(false);
  };

  const handleCloseRetireModal = () => {
    if (isRetiring) return;
    setSelectedProject(null);
    setRetireStage('IDLE');
    setRetireTxHash(null);
    setRetireError(null);
  };

  const handleConfirmRetirement = async () => {
    if (!selectedProject) return;

    const currentBal = onChainBalances[selectedProject.id] || 0n;
    const amountBig = BigInt(Math.round(retireAmount));

    if (amountBig <= 0n) {
      setRetireError('Retirement amount must be greater than zero.');
      return;
    }

    if (currentBal === 0n) {
      setRetireError(
        'Your connected wallet currently owns 0 MGROV credits for this project. You must hold credits in your wallet to burn/retire them on Polygon Amoy.'
      );
      return;
    }

    if (amountBig > currentBal) {
      setRetireError(
        `Retirement amount (${amountBig.toString()} t) exceeds your on-chain wallet balance (${currentBal.toString()} t).`
      );
      return;
    }

    const cleanWallet = (companyWallet || activeWallet || '').trim();
    if (!isAddress(cleanWallet)) {
      setRetireError('Please provide a valid Ethereum wallet address for corporate retirement records.');
      return;
    }

    setRetireError(null);
    setIsRetiring(true);
    setRetireStage('METAMASK');

    let confirmedTxHash = '';
    let confirmedBlockNumber = 0;
    const tokenId = resolveProjectTokenId(selectedProject);
    const tokenIdStr = tokenId.toString();

    // Step 1: Execute on-chain burn on Polygon Amoy
    try {
      setRetireStage('CONFIRMING');
      const { txHash, blockNumber } = await retireOnChainCredits(tokenId, amountBig);
      confirmedTxHash = txHash;
      confirmedBlockNumber = blockNumber;
      setRetireTxHash(txHash);
      setRetireBlockNumber(blockNumber);
    } catch (burnErr: any) {
      setRetireError(formatWeb3ErrorMessage(burnErr));
      setRetireStage('ERROR');
      setIsRetiring(false);
      return;
    }

    // Step 2: On-chain burn confirmed! Refresh on-chain balance immediately
    await fetchAllBalances();

    // Step 3: Synchronize with FastAPI backend
    setRetireStage('SYNCING');
    const syncPayload: RetireCreditsPayload = {
      project: selectedProject,
      tonsToRetire: Number(amountBig),
      companyName,
      companyWallet: cleanWallet,
      purpose,
      tokenId: tokenIdStr,
      transactionHash: confirmedTxHash,
      blockNumber: confirmedBlockNumber,
      retiredAt: new Date().toISOString(),
    };

    try {
      const res = await apiRetireCredits(syncPayload);

      if (res.success || res.source === 'FASTAPI') {
        setRetireStage('SUCCESS');
        setIsRetiring(false);
        onRetireCredits(res.updatedProject, res.retirementRecord);

        // Celebration Confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#10b981', '#fbbf24', '#ffffff'],
        });

        // Open certificate with real confirmed data
        onOpenCertificate(res.retirementRecord);
        setSelectedProject(null);
      } else {
        // Blockchain succeeded, backend sync pending
        setPendingSyncPayload(syncPayload);
        setRetireStage('SYNC_FAILED');
        setIsRetiring(false);
        onRetireCredits(res.updatedProject, res.retirementRecord);
      }
    } catch (syncErr: any) {
      setPendingSyncPayload(syncPayload);
      setRetireStage('SYNC_FAILED');
      setIsRetiring(false);
    }
  };

  // Retry backend persistence ONLY (never re-calls blockchain retire)
  const handleRetryBackendSync = async () => {
    if (!pendingSyncPayload) return;
    setIsRetryingSync(true);

    try {
      const res = await apiSyncRetirement(pendingSyncPayload);
      if (res.success && res.updatedProject && res.retirementRecord) {
        onRetireCredits(res.updatedProject, res.retirementRecord);
        setRetireStage('SUCCESS');
        onOpenCertificate(res.retirementRecord);
        setSelectedProject(null);
      } else {
        alert(`Backend sync retry failed: ${res.error || 'Server unreachable'}`);
      }
    } finally {
      setIsRetryingSync(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pillar 4 Hero Header - Clean Institutional Navy Banner */}
      <div className="relative overflow-hidden rounded-2xl p-8 bg-[#002B49] text-white border border-slate-700 shadow-md">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>Pillar 4: B2B Enterprise Marketplace & ESG Retirement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verified Blue Carbon Credits & On-Chain Retirement (Burn)
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light">
            Direct peer-to-peer ERC-1155 transfers and permanent credit retirements on <span className="text-emerald-400 font-semibold">Polygon Amoy Testnet</span>. Retiring credits irrevocably calls <span className="text-emerald-300 font-mono">contract.retire()</span>, burning units directly from your wallet to generate verifiable proofs for <span className="text-emerald-400 font-semibold">BRSR / SEC ESG compliance</span>.
          </p>
        </div>
      </div>

      {/* Network & Live Wallet Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Network: Polygon Amoy (#80002)</span>
          </div>

          <div className="text-slate-600">
            <span>Connected Wallet: </span>
            {activeWallet ? (
              <span className="text-slate-900 font-bold">
                {activeWallet.slice(0, 6)}...{activeWallet.slice(-4)}
              </span>
            ) : (
              <span className="text-amber-600">Not Connected</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAllBalances}
            disabled={isLoadingBalances}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalances ? 'animate-spin text-emerald-700' : ''}`} />
            <span>{isLoadingBalances ? 'Refreshing On-Chain Balances...' : 'Refresh Balances'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search verified mangrove projects, locations, or NGOs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs text-slate-500">
          <span className="font-mono text-emerald-700 font-bold">{filteredProjects.length} Projects Listed</span>
        </div>
      </div>

      {/* Project Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const tokenId = resolveProjectTokenId(project);
          const userBalance = onChainBalances[project.id] ?? 0n;
          const isPichavaram = project.id === PICHAVARAM_CANONICAL.projectId || project.name.toLowerCase().includes('pichavaram');
          const verifiedSupply = isPichavaram ? 100 : project.tokenization.totalMinted;

          return (
            <div
              key={project.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-md flex flex-col justify-between space-y-5 transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>GMW v3.0 Verified</span>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-base font-black text-[#002B49]">
                      ${project.tokenization.pricePerTonUSD.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-amber-700 font-mono">Demo Valuation / Ton</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-[#002B49] text-base group-hover:text-emerald-700 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{project.locationName}</span>
                  </div>
                </div>
              </div>

              {/* On-Chain ERC-1155 Telemetry Display */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5 font-mono text-xs text-slate-700">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Total Verified Supply:</span>
                  <span className="text-[#002B49] font-bold">{verifiedSupply.toLocaleString()} MGROV</span>
                </div>

                <div className="flex items-center justify-between bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                  <span className="text-emerald-900 font-semibold flex items-center space-x-1">
                    <Coins className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Your Wallet Balance:</span>
                  </span>
                  <span className="text-emerald-800 font-black text-sm">
                    {userBalance.toString()} MGROV
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Demo Available Pool:</span>
                  <span className="text-slate-600">{project.tokenization.availableCredits.toLocaleString()} t (Demo)</span>
                </div>
              </div>

              {/* Token ID and Explorer Link */}
              <div className="space-y-1 text-[11px] font-mono text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Token ID:</span>
                  <span className="text-slate-800 font-bold truncate max-w-[180px]" title={tokenId.toString()}>
                    {tokenId.toString().slice(0, 10)}...{tokenId.toString().slice(-8)}
                  </span>
                </div>
                {project.tokenization.txHash && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span>Contract:</span>
                    <a
                      href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline flex items-center space-x-0.5 font-semibold"
                    >
                      <span>{POLYGON_AMOY_CONFIG.contractAddress.slice(0, 6)}...{POLYGON_AMOY_CONFIG.contractAddress.slice(-4)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Co-Benefits Badges */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Ecological Co-Benefits:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {project.coBenefits.slice(0, 2).map((benefit, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 truncate max-w-[240px]"
                    >
                      🌱 {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer & Distinct Actions */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenTransferModal(project)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-1.5 border border-slate-200 transition-all"
                  title="Direct ERC-1155 safeTransferFrom on Polygon Amoy"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transfer Credits</span>
                </button>

                <button
                  onClick={() => handleOpenRetireModal(project)}
                  className="px-3 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
                  title="Permanently burn ERC-1155 credits via contract.retire()"
                >
                  <Flame className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Retire (Burn)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* DIRECT TRANSFER MODAL (safeTransferFrom)              */}
      {/* ---------------------------------------------------- */}
      {transferProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Send className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-[#002B49] text-base">Direct ERC-1155 Token Transfer</h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm">{transferProject.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseTransferModal}
                disabled={isTransferring}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Explanation Note */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-semibold">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>On-Chain Direct Credit Allocation:</span>
              </div>
              <p className="text-slate-500">
                This executes a real <span className="font-mono text-emerald-700 font-bold">safeTransferFrom</span> transaction on Polygon Amoy. No cryptocurrency payment is processed (peer-to-peer carbon credit transfer).
              </p>
            </div>

            {/* Balances Notice */}
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between font-mono text-xs">
              <span className="text-emerald-900">Your Current Balance:</span>
              <span className="text-emerald-800 font-bold">
                {(onChainBalances[transferProject.id] ?? 0n).toString()} MGROV
              </span>
            </div>

            {/* Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Recipient Ethereum Address (42 chars, 0x...)
                </label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={isTransferring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-medium">Credits to Transfer (MGROV)</label>
                  <button
                    type="button"
                    onClick={() => setTransferAmount(Number(onChainBalances[transferProject.id] || 0n))}
                    className="text-[10px] text-emerald-700 hover:underline font-mono font-bold"
                  >
                    Max
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={Number(onChainBalances[transferProject.id] || 0n)}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  disabled={isTransferring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Error Display */}
            {transferError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">{transferError}</div>
              </div>
            )}

            {/* Success Display */}
            {transferStage === 'SUCCESS' && transferTxHash && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 font-mono">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Transfer Confirmed on Polygon Amoy!</span>
                </div>
                <div className="text-[11px] break-all">
                  <span>Tx Hash: </span>
                  <a
                    href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${transferTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 underline inline-flex items-center space-x-1"
                  >
                    <span>{transferTxHash}</span>
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleCloseTransferModal}
                disabled={isTransferring}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                {transferStage === 'SUCCESS' ? 'Close' : 'Cancel'}
              </button>

              {transferStage !== 'SUCCESS' && (
                <button
                  onClick={handleExecuteDirectTransfer}
                  disabled={
                    isTransferring ||
                    transferAmount <= 0 ||
                    (onChainBalances[transferProject.id] || 0n) <= 0n
                  }
                  className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>
                        {transferStage === 'METAMASK'
                          ? 'Confirm in MetaMask...'
                          : 'Confirming on Polygon Amoy...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-white" />
                      <span>Execute Transfer</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* RETIREMENT / BURN MODAL (contract.retire)            */}
      {/* ---------------------------------------------------- */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-[#002B49] text-base">On-Chain Credit Retirement (Permanent Burn)</h3>
                  <p className="text-[11px] text-slate-500 font-mono truncate max-w-sm">{selectedProject.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseRetireModal}
                disabled={isRetiring}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Irreversible Burn Warning */}
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-800 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Irreversible Smart Contract Burn:</span>
              </div>
              <p className="text-amber-800/90">
                Retirement permanently burns these carbon credits directly from your connected wallet on Polygon Amoy via <span className="font-mono text-emerald-800 font-bold">contract.retire(tokenId, amount)</span>. Burned credits can never be recovered or re-transferred.
              </p>
            </div>

            {/* Wallet Balance Display */}
            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 flex items-center justify-between font-mono text-xs">
              <span className="text-emerald-900">Your Actual Wallet Balance:</span>
              <span className="text-emerald-800 font-bold">
                {(onChainBalances[selectedProject.id] ?? 0n).toString()} MGROV
              </span>
            </div>

            {/* Retirement Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Corporate Beneficiary Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tata Consultancy Services - ESG Scope 1"
                  disabled={isRetiring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Corporate Wallet Address</label>
                <input
                  type="text"
                  value={companyWallet}
                  onChange={(e) => setCompanyWallet(e.target.value)}
                  disabled={isRetiring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Retirement Purpose / Compliance Claim</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. BRSR FY26 Scope 2 Data Center Decarbonization"
                  disabled={isRetiring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-medium">Tons to Burn</label>
                    <button
                      type="button"
                      onClick={() => setRetireAmount(Number(onChainBalances[selectedProject.id] || 0n))}
                      className="text-[10px] text-emerald-700 hover:underline font-mono font-bold"
                    >
                      Max
                    </button>
                  </div>
                  <input
                    type="number"
                    max={Number(onChainBalances[selectedProject.id] || 0n)}
                    min={1}
                    value={retireAmount}
                    onChange={(e) => setRetireAmount(Number(e.target.value))}
                    disabled={isRetiring}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Simulated Valuation</label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-amber-700 font-mono font-bold">
                    ${(retireAmount * selectedProject.tokenization.pricePerTonUSD).toLocaleString()} USD (Demo)
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {retireError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">{retireError}</div>
              </div>
            )}

            {/* Backend Sync Pending / Failed Recovery State */}
            {retireStage === 'SYNC_FAILED' && retireTxHash && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-3 font-mono">
                <div className="flex items-center space-x-2 font-bold text-amber-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>On-Chain Retirement Confirmed! (Backend Sync Pending)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Your carbon credits were <span className="text-emerald-700 font-bold">permanently burned on Polygon Amoy</span>. However, saving the receipt to the local database encountered a timeout. Your credits are safely burned.
                </p>
                <div className="text-[11px] break-all bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                  <div>
                    <span>Tx Hash: </span>
                    <a
                      href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${retireTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 underline inline-flex items-center space-x-1"
                    >
                      <span>{retireTxHash}</span>
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </div>
                  {retireBlockNumber && (
                    <div className="text-slate-500">
                      <span>Confirmed Block: </span>
                      <span className="text-emerald-700 font-bold">#{retireBlockNumber}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRetryBackendSync}
                  disabled={isRetryingSync}
                  className="w-full py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetryingSync ? 'animate-spin' : ''}`} />
                  <span>{isRetryingSync ? 'Retrying Database Sync...' : 'Retry Backend Synchronization'}</span>
                </button>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleCloseRetireModal}
                disabled={isRetiring}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                {retireStage === 'SYNC_FAILED' ? 'Dismiss' : 'Cancel'}
              </button>

              {retireStage !== 'SYNC_FAILED' && (
                <button
                  onClick={handleConfirmRetirement}
                  disabled={
                    isRetiring ||
                    retireAmount <= 0 ||
                    (onChainBalances[selectedProject.id] || 0n) <= 0n
                  }
                  className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-extrabold text-xs flex items-center space-x-2 shadow-sm transition-all disabled:opacity-50"
                >
                  {isRetiring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>
                        {retireStage === 'METAMASK'
                          ? 'Confirm in MetaMask...'
                          : retireStage === 'CONFIRMING'
                          ? 'Burning on Polygon Amoy...'
                          : 'Recording Retirement...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 text-white" />
                      <span>Execute Burn & Generate Certificate</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
