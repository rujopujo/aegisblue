import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Coins,
  Copy,
  Check,
  FileCheck,
  ChevronDown,
  ChevronUp
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
  getConnectedWalletAddress,
  isRealAmoyTxHash
} from '../services/web3Registry';
import {
  getDemoWalletState,
  subscribeDemoWallet,
  getProjectDemoCredits,
  executeDemoTransfer,
  executeDemoRetirement,
  topUpUsdTreasury,
  mintDemoCredits,
  resetDemoWallet,
  DemoWalletState,
} from '../services/demoWallet';


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
  const [isDemoTransfer, setIsDemoTransfer] = useState<boolean>(false);
  const [isDemoRetire, setIsDemoRetire] = useState<boolean>(false);
  const [showTransferAudit, setShowTransferAudit] = useState<boolean>(false);
  const [copiedTxHash, setCopiedTxHash] = useState<boolean>(false);

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

  // Demo Wallet State ($1,000,000 USD Liquid Treasury + MGROV credits)
  const [demoWalletState, setDemoWalletState] = useState<DemoWalletState>(() => getDemoWalletState());

  useEffect(() => {
    const unsub = subscribeDemoWallet(setDemoWalletState);
    return () => unsub();
  }, []);

  const totalDemoHoldingCredits = useMemo(() => {
    return projects.reduce((sum, p) => {
      const onChain = Number(onChainBalances[p.id] || 0n);
      const demo = getProjectDemoCredits(p.id);
      return sum + (onChain > 0 ? onChain : demo);
    }, 0);
  }, [projects, onChainBalances, demoWalletState]);

  const totalDemoHoldingUsd = useMemo(() => {
    return projects.reduce((sum, p) => {
      const onChain = Number(onChainBalances[p.id] || 0n);
      const demo = getProjectDemoCredits(p.id);
      const bal = onChain > 0 ? onChain : demo;
      return sum + bal * (p.tokenization?.pricePerTonUSD || 32);
    }, 0);
  }, [projects, onChainBalances, demoWalletState]);

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
    const onChainBal = Number(onChainBalances[project.id] || 0n);
    const demoBal = getProjectDemoCredits(project.id);
    const userBal = onChainBal > 0 ? onChainBal : demoBal;
    setTransferAmount(userBal > 0 ? 1 : 0);
    setTransferStage('IDLE');
    setTransferTxHash(null);
    setTransferError(null);
    setIsTransferring(false);
    setShowTransferAudit(false);
    setCopiedTxHash(false);
    setIsDemoTransfer(onChainBal <= 0);
  };

  const handleCloseTransferModal = () => {
    if (isTransferring) return;
    setTransferProject(null);
    setTransferStage('IDLE');
    setTransferTxHash(null);
    setTransferError(null);
    setShowTransferAudit(false);
    setCopiedTxHash(false);
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

    const onChainBal = Number(onChainBalances[transferProject.id] || 0n);
    const demoBal = getProjectDemoCredits(transferProject.id);
    const currentBal = onChainBal > 0 ? onChainBal : demoBal;
    const amount = Math.round(transferAmount);

    if (amount <= 0) {
      setTransferError('Transfer amount must be greater than zero.');
      return;
    }

    if (amount > currentBal) {
      setTransferError(`Cannot transfer ${amount} credits. Your wallet holds ${currentBal} credits.`);
      return;
    }

    setTransferError(null);
    setIsTransferring(true);
    setTransferStage('METAMASK');

    try {
      if (onChainBal > 0) {
        setIsDemoTransfer(false);
        const tokenId = resolveProjectTokenId(transferProject);
        setTransferStage('CONFIRMING');
        const { txHash } = await transferOnChainCredits(cleanRecipient, tokenId, BigInt(amount));
        setTransferTxHash(txHash);
      } else {
        setIsDemoTransfer(true);
        // Execute simulated demo transfer and deduct from demo wallet
        setTransferStage('CONFIRMING');
        await new Promise((r) => setTimeout(r, 600));
        const res = executeDemoTransfer(transferProject.id, amount);
        setTransferTxHash(res.txHash);
      }

      setTransferStage('SUCCESS');
      setIsTransferring(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
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
    const availBal = Math.round(project.tokenization.availableCredits || 0);
    const effectiveBal = userBal > 0 ? userBal : availBal;
    setRetireAmount(effectiveBal > 0 ? Math.min(5, effectiveBal) : 1);
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

    const onChainBal = Number(onChainBalances[selectedProject.id] || 0n);
    const demoBal = getProjectDemoCredits(selectedProject.id);
    const effectiveBal = onChainBal > 0 ? onChainBal : demoBal;
    const amount = Math.round(retireAmount);

    if (amount <= 0) {
      setRetireError('Retirement amount must be greater than zero.');
      return;
    }

    if (effectiveBal <= 0) {
      setRetireError('There are 0 available credits in your wallet for this project to retire.');
      return;
    }

    if (amount > effectiveBal) {
      setRetireError(`Retirement amount (${amount} t) exceeds your balance (${effectiveBal} t).`);
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

    // Step 1: Execute on-chain burn on Polygon Amoy if user holds on-chain credits
    if (onChainBal > 0) {
      setIsDemoRetire(false);
      try {
        setRetireStage('CONFIRMING');
        const { txHash, blockNumber } = await retireOnChainCredits(tokenId, BigInt(amount));
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
    } else {
      setIsDemoRetire(true);
      // Operator / Simulation burn confirmation and demo balance deduction
      setRetireStage('CONFIRMING');
      await new Promise((r) => setTimeout(r, 600));
      const res = executeDemoRetirement(selectedProject.id, amount);
      const simBlock = 14892600 + Math.floor(Math.random() * 1000);
      confirmedTxHash = res.txHash;
      confirmedBlockNumber = simBlock;
      setRetireTxHash(res.txHash);
      setRetireBlockNumber(simBlock);
    }

    // Step 2: On-chain burn confirmed! Refresh on-chain balance immediately
    await fetchAllBalances();

    // Step 3: Synchronize with FastAPI backend
    setRetireStage('SYNCING');
    const syncPayload: RetireCreditsPayload = {
      project: selectedProject,
      tonsToRetire: amount,
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
      {/* Pillar 4 Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#1e1b4b] border border-blue-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold">
            <ShoppingBag className="w-4 h-4" />
            <span>Pillar 4: B2B Enterprise Marketplace & ESG Retirement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verified Blue Carbon Credits & On-Chain Retirement (Burn)
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Direct peer-to-peer ERC-1155 transfers and permanent credit retirements on <span className="text-cyan-400 font-semibold">Polygon Amoy Testnet</span>. Retiring credits irrevocably calls <span className="text-emerald-400 font-mono">contract.retire()</span>, burning units directly from your wallet to generate verifiable proofs for <span className="text-emerald-400 font-semibold">BRSR / SEC ESG compliance</span>.
          </p>
        </div>
      </div>

      {/* Enterprise Treasury & Dummy Liquidity Banner ($1,000,000 USD) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-ocean-900/80 to-teal-950/70 border border-emerald-500/40 shadow-2xl backdrop-blur-md space-y-4 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
              <Coins className="w-3.5 h-3.5" />
              <span>Enterprise ESG Treasury Account</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>Corporate Liquidity:</span>
              <span className="text-emerald-400 font-mono">
                {demoWalletState.usdTreasury.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                })}
              </span>
            </h2>
            <p className="text-xs text-slate-300">
              Allocated blue carbon purchasing liquidity &amp; peer-to-peer transferable MGROV credits for corporate net-zero simulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                topUpUsdTreasury(1000000);
                confetti({ particleCount: 50, spread: 60 });
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Add another $1,000,000 USD to Enterprise Treasury"
            >
              <Coins className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ $1,000,000 USD</span>
            </button>

            <button
              onClick={() => {
                projects.forEach((p) => mintDemoCredits(p.id, 10000));
                confetti({ particleCount: 70, spread: 70 });
              }}
              className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              title="Mint 10,000 MGROV credits for all listed projects"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ 10,000 MGROV All</span>
            </button>

            <button
              onClick={() => {
                resetDemoWallet();
              }}
              className="px-3 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-slate-300 border border-ocean-700 text-xs font-semibold flex items-center space-x-1 transition-all"
              title="Reset Treasury to $1,000,000 USD and baseline credits"
            >
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Aggregate Portfolio Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-ocean-800/80 text-xs">
          <div className="bg-black/30 p-2.5 rounded-xl border border-ocean-800">
            <span className="text-slate-400 text-[10px] block">Corporate Treasury (USD):</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {demoWalletState.usdTreasury.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-ocean-800">
            <span className="text-slate-400 text-[10px] block">Total Carbon Assets Held:</span>
            <span className="text-cyan-300 font-mono font-bold text-sm">
              {totalDemoHoldingCredits.toLocaleString()} MGROV
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-ocean-800">
            <span className="text-slate-400 text-[10px] block">Carbon Portfolio Valuation:</span>
            <span className="text-amber-300 font-mono font-bold text-sm">
              ${totalDemoHoldingUsd.toLocaleString()} USD
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-xl border border-ocean-800">
            <span className="text-slate-400 text-[10px] block">Net ESG Liquidity Status:</span>
            <span className="text-emerald-400 font-mono font-bold text-xs flex items-center space-x-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Fully Funded ($1M+)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Network & Live Wallet Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-cyan-500/20 text-xs font-mono">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Network: Polygon Amoy (#80002)</span>
          </div>

          <div className="text-slate-300">
            <span>Connected Wallet: </span>
            {activeWallet ? (
              <span className="text-cyan-300 font-bold">
                {activeWallet.slice(0, 6)}...{activeWallet.slice(-4)}
              </span>
            ) : (
              <span className="text-amber-400">Not Connected</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAllBalances}
            disabled={isLoadingBalances}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-cyan-300 border border-ocean-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalances ? 'animate-spin' : ''}`} />
            <span>{isLoadingBalances ? 'Refreshing On-Chain Balances...' : 'Refresh Balances'}</span>
          </button>
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
          <span className="font-mono text-emerald-400 font-bold">{filteredProjects.length} Projects Listed</span>
        </div>
      </div>

      {/* Project Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const tokenId = resolveProjectTokenId(project);
          const onChainBal = Number(onChainBalances[project.id] ?? 0n);
          const demoBal = getProjectDemoCredits(project.id);
          const userBalance = onChainBal > 0 ? onChainBal : demoBal;
          const userUsdVal = userBalance * project.tokenization.pricePerTonUSD;
          const isPichavaram = project.id === PICHAVARAM_CANONICAL.projectId || project.name.toLowerCase().includes('pichavaram');
          const verifiedSupply = isPichavaram ? 100 : project.tokenization.totalMinted;

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
                    <div className="font-mono text-base font-black text-white">
                      ${project.tokenization.pricePerTonUSD.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-amber-300/80 font-mono">Demo Enterprise Valuation</div>
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

              {/* On-Chain ERC-1155 Telemetry Display */}
              <div className="bg-ocean-950/90 p-3.5 rounded-xl border border-cyan-500/30 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-ocean-800">
                  <span className="text-slate-400">Total Verified Supply:</span>
                  <span className="text-white font-bold">{verifiedSupply.toLocaleString()} MGROV</span>
                </div>

                <div className="flex items-center justify-between bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
                  <span className="text-cyan-300 font-semibold flex items-center space-x-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Your Wallet Balance:</span>
                  </span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-sm">
                      {userBalance.toLocaleString()} MGROV
                    </span>
                    <div className="text-[10px] text-emerald-300 font-mono">
                      ${userUsdVal.toLocaleString()} USD
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Demo Available Pool:</span>
                  <span className="text-slate-300">{project.tokenization.availableCredits.toLocaleString()} t (Demo)</span>
                </div>
              </div>

              {/* Token ID and Explorer Link */}
              <div className="space-y-1 text-[11px] font-mono text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Token ID:</span>
                  <span className="text-cyan-300 font-bold truncate max-w-[180px]" title={tokenId.toString()}>
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
                      className="text-cyan-400 hover:underline flex items-center space-x-0.5"
                    >
                      <span>{POLYGON_AMOY_CONFIG.contractAddress.slice(0, 6)}...{POLYGON_AMOY_CONFIG.contractAddress.slice(-4)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
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

              {/* Card Footer & Distinct Actions */}
              <div className="pt-3 border-t border-ocean-800 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleOpenTransferModal(project)}
                  className="px-3 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-cyan-300 font-bold text-xs flex items-center justify-center space-x-1.5 border border-ocean-700 transition-all"
                  title="Direct ERC-1155 safeTransferFrom on Polygon Amoy"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transfer Credits</span>
                </button>

                <button
                  onClick={() => handleOpenRetireModal(project)}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                  title="Permanently burn ERC-1155 credits via contract.retire()"
                >
                  <Flame className="w-3.5 h-3.5 text-yellow-300" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-ocean-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Direct ERC-1155 Token Transfer</h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">{transferProject.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseTransferModal}
                disabled={isTransferring}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Explanation Note */}
            {transferProject && Number(onChainBalances[transferProject.id] || 0n) > 0 ? (
              <div className="bg-ocean-950/80 p-3 rounded-xl border border-cyan-500/40 text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-cyan-300 font-semibold">
                  <Info className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                  <span>On-Chain Direct Credit Allocation (Polygon Amoy PoS):</span>
                </div>
                <p className="text-slate-400">
                  You hold live on-chain MGROV credits. This executes a real <span className="font-mono text-cyan-300">safeTransferFrom</span> transaction on Polygon Amoy via MetaMask.
                </p>
              </div>
            ) : (
              <div className="bg-ocean-950/80 p-3 rounded-xl border border-emerald-500/40 text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold">
                  <Info className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>Enterprise Demo Treasury Transfer (Simulated Gasless Settlement):</span>
                </div>
                <p className="text-slate-400">
                  Allocating credits from your <span className="text-emerald-400 font-bold">$1,000,000 Enterprise Demo Treasury</span>. Instant peer-to-peer settlement in local ledger with zero gas fees.
                </p>
              </div>
            )}

            {/* Balances Notice */}
            {(() => {
              const onChain = Number(onChainBalances[transferProject.id] || 0n);
              const demo = getProjectDemoCredits(transferProject.id);
              const curBal = onChain > 0 ? onChain : demo;
              const curUsd = curBal * transferProject.tokenization.pricePerTonUSD;
              return (
                <div className="bg-ocean-950 p-3 rounded-xl border border-cyan-500/20 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">Your Current Balance:</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">
                      {curBal.toLocaleString()} MGROV
                    </span>
                    <span className="text-[10px] text-emerald-300 ml-2">
                      (${curUsd.toLocaleString()} USD)
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-medium">
                    Recipient Ethereum Address (42 chars, 0x...)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono">Quick-Fill Demo Wallets:</span>
                </div>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={isTransferring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                />

                {/* 1-Click Quick-Fill Demo Address Chips */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setRecipientAddress('0x71C840798Ceb983Fa70560a8927FDEda32509E34')}
                    className="px-2 py-1 rounded-lg bg-ocean-800 hover:bg-ocean-700 border border-ocean-700 text-[10px] font-mono text-cyan-300 transition-colors"
                    title="Click to fill Tata NetZero Corporate Treasury Address"
                  >
                    🏢 Corporate ESG Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientAddress('0x3B88e63F9D661d9a244C3A73Ec5D875F7925e510')}
                    className="px-2 py-1 rounded-lg bg-ocean-800 hover:bg-ocean-700 border border-ocean-700 text-[10px] font-mono text-emerald-300 transition-colors"
                    title="Click to fill Sundarbans NGO Alliance Wallet Address"
                  >
                    🌱 NGO Alliance Wallet
                  </button>
                  {activeWallet && (
                    <button
                      type="button"
                      onClick={() => setRecipientAddress(activeWallet)}
                      className="px-2 py-1 rounded-lg bg-ocean-800 hover:bg-ocean-700 border border-ocean-700 text-[10px] font-mono text-purple-300 transition-colors"
                      title="Click to fill your currently connected MetaMask wallet address"
                    >
                      👤 My Wallet ({activeWallet.slice(0, 6)}...{activeWallet.slice(-4)})
                    </button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">Credits to Transfer (MGROV)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const onChain = Number(onChainBalances[transferProject.id] || 0n);
                      const demo = getProjectDemoCredits(transferProject.id);
                      setTransferAmount(onChain > 0 ? onChain : demo);
                    }}
                    className="text-[10px] text-cyan-400 hover:underline font-mono"
                  >
                    Max
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={Number(onChainBalances[transferProject.id] || 0n) > 0 ? Number(onChainBalances[transferProject.id]) : getProjectDemoCredits(transferProject.id)}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  disabled={isTransferring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Error Display */}
            {transferError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{transferError}</div>
              </div>
            )}

            {/* Success Display */}
            {transferStage === 'SUCCESS' && transferTxHash && (
              <div className="p-4 rounded-2xl bg-ocean-950 border border-emerald-500/50 text-xs space-y-3 font-mono animate-fadeIn">
                {(isDemoTransfer || !isRealAmoyTxHash(transferTxHash)) ? (
                  // Enterprise Demo Treasury Settlement Receipt
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-emerald-400 text-sm">
                            Transfer Confirmed (Enterprise Demo Settlement)
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Instant Peer-to-Peer Allocation • Demo Treasury Ledger
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                        SETTLED
                      </span>
                    </div>

                    {/* Transfer Summary Metrics */}
                    <div className="p-3 rounded-xl bg-ocean-900/80 border border-ocean-800 space-y-2 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Transferred Credits:</span>
                        <span className="text-emerald-300 font-bold">
                          {transferAmount.toLocaleString()} MGROV
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Settlement Valuation:</span>
                        <span className="text-cyan-300 font-bold">
                          ${(transferAmount * (transferProject.tokenization?.pricePerTonUSD || 10)).toLocaleString()} USD
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Recipient Address:</span>
                        <span className="text-slate-200 truncate max-w-[220px]" title={recipientAddress}>
                          {recipientAddress.slice(0, 10)}...{recipientAddress.slice(-8)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Settlement Source:</span>
                        <span className="text-purple-300 font-bold">
                          Enterprise Liquid Treasury ($1,000,000 Pool)
                        </span>
                      </div>
                    </div>

                    {/* Audit Reference ID & Copy Button */}
                    <div className="space-y-1.5 bg-black/40 p-3 rounded-xl border border-ocean-800">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-semibold">Audit Reference Hash (Demo Ledger):</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(transferTxHash);
                            setCopiedTxHash(true);
                            setTimeout(() => setCopiedTxHash(false), 2000);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                        >
                          {copiedTxHash ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Hash</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="text-[11px] text-cyan-300 break-all select-all font-mono bg-ocean-950/80 p-2 rounded-lg border border-ocean-850">
                        {transferTxHash}
                      </div>
                    </div>

                    {/* Verified Smart Contract on PolygonScan (Real Amoy Contract Address) */}
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        <span className="text-cyan-300 font-bold">Protocol Transparency: </span>
                        This transfer settled instantly via your Enterprise Demo Treasury without gas fees. To inspect the live verified AegisBlue ERC-1155 smart contract deployed on <span className="text-purple-300 font-semibold">Polygon Amoy Testnet</span>:
                      </div>
                      <a
                        href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/40 text-cyan-200 text-[11px] font-semibold transition-colors"
                      >
                        <span>Inspect Smart Contract ({POLYGON_AMOY_CONFIG.contractAddress.slice(0, 6)}...{POLYGON_AMOY_CONFIG.contractAddress.slice(-4)}) on PolygonScan</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>

                    {/* Cryptographic Proof Inspector Accordion */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowTransferAudit(!showTransferAudit)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-ocean-900/60 hover:bg-ocean-900 border border-ocean-800 text-slate-300 text-[11px] transition-colors"
                      >
                        <span className="flex items-center space-x-1.5">
                          <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                          <span>Cryptographic Settlement Audit Proof</span>
                        </span>
                        {showTransferAudit ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showTransferAudit && (
                        <div className="mt-2 p-3 rounded-xl bg-black/60 border border-ocean-800 text-[10px] text-slate-300 font-mono space-y-1 animate-fadeIn">
                          <div className="text-emerald-400 font-bold">// AegisBlue Off-Chain Settlement Log</div>
                          <div>"protocol": "AegisBlue-ERC1155-v2"</div>
                          <div>"contract_amoy": "{POLYGON_AMOY_CONFIG.contractAddress}"</div>
                          <div>"token_id": "{resolveProjectTokenId(transferProject).toString()}"</div>
                          <div>"sender": "{activeWallet || 'Enterprise-Treasury-0x0'}"</div>
                          <div>"recipient": "{recipientAddress}"</div>
                          <div>"amount_mgrov": {transferAmount}</div>
                          <div>"valuation_usd": ${(transferAmount * (transferProject.tokenization?.pricePerTonUSD || 10)).toFixed(2)}</div>
                          <div>"settlement_type": "OFF_CHAIN_DEMO_TREASURY"</div>
                          <div>"status": "SETTLED_SUCCESS"</div>
                          <div>"timestamp": "{new Date().toISOString()}"</div>
                          <div>"audit_signature": "{transferTxHash}"</div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Live On-Chain Settlement Receipt
                  <>
                    <div className="flex items-center space-x-2 font-bold text-emerald-400 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>Transfer Confirmed on Polygon Amoy!</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Your transaction has been broadcast and verified on Polygon Amoy PoS testnet.
                    </p>
                    <div className="text-[11px] break-all bg-ocean-900/80 p-3 rounded-xl border border-ocean-800 space-y-1">
                      <span className="text-slate-400">Transaction Hash: </span>
                      <a
                        href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${transferTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-300 hover:text-cyan-200 underline inline-flex items-center space-x-1"
                      >
                        <span>{transferTxHash}</span>
                        <ExternalLink className="w-3.5 h-3.5 inline ml-1" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={handleCloseTransferModal}
                disabled={isTransferring}
                className="px-4 py-2.5 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-slate-300 text-xs font-semibold"
              >
                {transferStage === 'SUCCESS' ? 'Close' : 'Cancel'}
              </button>

              {transferStage !== 'SUCCESS' && (
                <button
                  onClick={handleExecuteDirectTransfer}
                  disabled={
                    isTransferring ||
                    transferAmount <= 0 ||
                    !recipientAddress.trim() ||
                    transferAmount >
                      (Number(onChainBalances[transferProject.id] || 0n) > 0
                        ? Number(onChainBalances[transferProject.id])
                        : getProjectDemoCredits(transferProject.id))
                  }
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-ocean-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">On-Chain Credit Retirement (Permanent Burn)</h3>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">{selectedProject.name}</p>
                </div>
              </div>
              <button
                onClick={handleCloseRetireModal}
                disabled={isRetiring}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Irreversible Burn Warning */}
            <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-300 font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Irreversible Smart Contract Burn:</span>
              </div>
              <p className="text-slate-400">
                Retirement permanently burns these carbon credits directly from your connected wallet on Polygon Amoy via <span className="font-mono text-cyan-300">contract.retire(tokenId, amount)</span>. Burned credits can never be recovered or re-transferred.
              </p>
            </div>

            {/* Wallet Balance Display */}
            {(() => {
              const onChain = Number(onChainBalances[selectedProject.id] || 0n);
              const demo = getProjectDemoCredits(selectedProject.id);
              const curBal = onChain > 0 ? onChain : demo;
              const curUsd = curBal * selectedProject.tokenization.pricePerTonUSD;
              return (
                <div className="bg-ocean-950 p-3 rounded-xl border border-cyan-500/20 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">Your Current Balance:</span>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">
                      {curBal.toLocaleString()} MGROV
                    </span>
                    <span className="text-[10px] text-emerald-300 ml-2">
                      (${curUsd.toLocaleString()} USD)
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Retirement Inputs */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Corporate Beneficiary Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tata Consultancy Services - ESG Scope 1"
                  disabled={isRetiring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Corporate Wallet Address</label>
                <input
                  type="text"
                  value={companyWallet}
                  onChange={(e) => setCompanyWallet(e.target.value)}
                  disabled={isRetiring}
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
                  disabled={isRetiring}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-medium">Tons to Burn</label>
                    <button
                      type="button"
                      onClick={() => {
                        const onChain = Number(onChainBalances[selectedProject.id] || 0n);
                        const demo = getProjectDemoCredits(selectedProject.id);
                        setRetireAmount(onChain > 0 ? onChain : demo);
                      }}
                      className="text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      Max
                    </button>
                  </div>
                  <input
                    type="number"
                    max={Number(onChainBalances[selectedProject.id] || 0n) > 0 ? Number(onChainBalances[selectedProject.id]) : getProjectDemoCredits(selectedProject.id)}
                    min={1}
                    value={retireAmount}
                    onChange={(e) => setRetireAmount(Number(e.target.value))}
                    disabled={isRetiring}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Simulated Valuation</label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-amber-300 font-mono font-bold">
                    ${(retireAmount * selectedProject.tokenization.pricePerTonUSD).toLocaleString()} USD (Demo)
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {retireError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">{retireError}</div>
              </div>
            )}

            {/* Backend Sync Pending / Failed Recovery State */}
            {retireStage === 'SYNC_FAILED' && retireTxHash && (
              <div className="p-4 rounded-2xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs space-y-3 font-mono">
                <div className="flex items-center space-x-2 font-bold text-amber-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isDemoRetire ? 'Demo Retirement Confirmed! (Backend Sync Pending)' : 'On-Chain Retirement Confirmed! (Backend Sync Pending)'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isDemoRetire
                    ? 'Your carbon credits were deducted from your enterprise demo treasury. However, saving the receipt to the local database encountered a timeout.'
                    : 'Your carbon credits were permanently burned on Polygon Amoy. However, saving the receipt to the local database encountered a timeout. Your credits are safely burned.'}
                </p>
                <div className="text-[11px] break-all bg-ocean-950 p-2.5 rounded-lg border border-ocean-800 space-y-1.5">
                  <div>
                    <span className="text-slate-400">{isDemoRetire ? 'Demo Audit Hash: ' : 'Tx Hash: '}</span>
                    {isDemoRetire ? (
                      <span className="text-cyan-300">{retireTxHash}</span>
                    ) : (
                      <a
                        href={`${POLYGON_AMOY_CONFIG.blockExplorer}/tx/${retireTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-300 underline inline-flex items-center space-x-1"
                      >
                        <span>{retireTxHash}</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    )}
                  </div>
                  {isDemoRetire ? (
                    <div>
                      <a
                        href={`${POLYGON_AMOY_CONFIG.blockExplorer}/address/${POLYGON_AMOY_CONFIG.contractAddress}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-teal-300 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>Inspect AegisBlue Smart Contract on PolygonScan</span>
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </div>
                  ) : (
                    retireBlockNumber && (
                      <div className="text-slate-400">
                        <span>Confirmed Block: </span>
                        <span className="text-emerald-400 font-bold">#{retireBlockNumber}</span>
                      </div>
                    )
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleRetryBackendSync}
                  disabled={isRetryingSync}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
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
                className="px-4 py-2.5 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-slate-300 text-xs font-semibold"
              >
                {retireStage === 'SYNC_FAILED' ? 'Dismiss' : 'Cancel'}
              </button>

              {retireStage !== 'SYNC_FAILED' && (
                <button
                  onClick={handleConfirmRetirement}
                  disabled={
                    isRetiring ||
                    retireAmount <= 0 ||
                    retireAmount >
                      (Number(onChainBalances[selectedProject.id] || 0n) > 0
                        ? Number(onChainBalances[selectedProject.id])
                        : getProjectDemoCredits(selectedProject.id))
                  }
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
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
