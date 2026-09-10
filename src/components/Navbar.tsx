import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Satellite, 
  Coins, 
  ShoppingBag, 
  BarChart3, 
  Wallet, 
  Globe2,
  ExternalLink
} from 'lucide-react';
import { POLYGON_AMOY_CONFIG } from '../services/web3Registry';
import { checkBackendHealth, subscribeToBackendStatus, BackendStatus } from '../services/apiClient';

interface NavbarProps {
  activeTab: 'home' | 'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | 'dashboard';
  setActiveTab: (tab: 'home' | 'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | 'dashboard') => void;
  walletAddress: string;
  isWalletConnected: boolean;
  isCorrectNetwork?: boolean;
  isConnectingWallet?: boolean;
  onConnectWallet: () => void;
  onSwitchNetwork?: () => void;
  totalSequesteredTons: number;
  totalTokensMinted: number;
  totalRetiredTons: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  walletAddress,
  isWalletConnected,
  isCorrectNetwork = true,
  isConnectingWallet = false,
  onConnectWallet,
  onSwitchNetwork,
  totalSequesteredTons,
  totalTokensMinted,
  totalRetiredTons,
}) => {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({ isOnline: false });

  useEffect(() => {
    checkBackendHealth();
    const unsub = subscribeToBackendStatus(setBackendStatus);
    const interval = setInterval(() => checkBackendHealth(), 8000);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Institutional Header Bar */}
      <div className="bg-[#002B49] text-white px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="font-semibold text-emerald-400">Co-Organized By:</span>
            <span>Conservation International</span>
            <span className="text-slate-500">•</span>
            <span>IUCN</span>
            <span className="text-slate-500">•</span>
            <span>IOC-UNESCO</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300 font-mono">GMW v3.0</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-300">
            <div>
              <span>Verified: </span>
              <strong className="text-emerald-400">{totalSequesteredTons.toLocaleString()} t</strong>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="hidden sm:block">
              <span>Minted: </span>
              <strong className="text-teal-400">{totalTokensMinted.toLocaleString()}</strong>
            </div>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="hidden sm:block">
              <span>Retired: </span>
              <strong className="text-cyan-300">{totalRetiredTons.toLocaleString()} t</strong>
            </div>
            <span className="text-slate-600">|</span>
            <a
              href={POLYGON_AMOY_CONFIG.blockExplorer}
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-white flex items-center space-x-1"
            >
              <span>{POLYGON_AMOY_CONFIG.networkName}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Clean Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#003366] via-[#006699] to-[#059669] p-0.5 shadow-md flex items-center justify-center">
            <Globe2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-black text-[#002B49] tracking-tight uppercase">
              The Blue Carbon Initiative
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Digital MRV & Web3 Coastal Carbon Registry
            </p>
          </div>
        </div>

        {/* Pillar Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 font-semibold text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'home'
                ? 'bg-slate-100 text-[#002B49] font-bold'
                : 'text-slate-600 hover:text-[#002B49] hover:bg-slate-50'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('pillar1')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'pillar1'
                ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                : 'text-slate-600 hover:text-[#002B49] hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>1. Gatekeeper</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar2')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'pillar2'
                ? 'bg-sky-50 text-sky-800 font-bold border border-sky-200'
                : 'text-slate-600 hover:text-[#002B49] hover:bg-slate-50'
            }`}
          >
            <Satellite className="w-4 h-4 text-sky-600" />
            <span>2. Satellite MRV</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar3')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'pillar3'
                ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                : 'text-slate-600 hover:text-[#002B49] hover:bg-slate-50'
            }`}
          >
            <Coins className="w-4 h-4 text-teal-600" />
            <span>3. Tokenization</span>
          </button>

          <button
            onClick={() => setActiveTab('pillar4')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'pillar4'
                ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                : 'text-slate-600 hover:text-[#002B49] hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>4. Marketplace</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                : 'text-slate-600 hover:text-[#002B49] hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Corporate ESG</span>
          </button>
        </nav>

        {/* Backend & Corporate Wallet Connectors */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {backendStatus.isOnline ? (
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              title="FastAPI Python MRV Backend Online! Click to view interactive Swagger Docs."
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">FastAPI</span>
              <span>MRV Active</span>
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            </a>
          ) : (
            <div
              title="Running in Standalone Client Mode. Automatic client-side MRV engine is active."
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="hidden sm:inline">Client Mode</span>
              <span className="sm:hidden">Client</span>
            </div>
          )}

          {isWalletConnected && !isCorrectNetwork && (
            <button
              onClick={onSwitchNetwork}
              title="Click to switch your wallet network to Polygon Amoy (Chain ID 80002)"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 text-xs font-mono font-semibold shadow-sm transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Switch to Amoy</span>
            </button>
          )}

          <button
            onClick={onConnectWallet}
            disabled={isConnectingWallet}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#003B66] text-white text-xs font-mono font-semibold shadow-sm transition-all disabled:opacity-75"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isConnectingWallet
                ? 'Connecting...'
                : isWalletConnected && walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'Connect Wallet'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isWalletConnected && isCorrectNetwork
                  ? 'bg-emerald-400 animate-pulse'
                  : isWalletConnected
                  ? 'bg-amber-400'
                  : 'bg-slate-400'
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-200 overflow-x-auto text-xs space-x-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'home' ? 'bg-[#002B49] text-white font-bold' : 'text-slate-600'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('pillar1')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'pillar1' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-600'
          }`}
        >
          1. Gatekeeper
        </button>
        <button
          onClick={() => setActiveTab('pillar2')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'pillar2' ? 'bg-sky-700 text-white font-bold' : 'text-slate-600'
          }`}
        >
          2. Satellite MRV
        </button>
        <button
          onClick={() => setActiveTab('pillar3')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'pillar3' ? 'bg-teal-700 text-white font-bold' : 'text-slate-600'
          }`}
        >
          3. Tokenization
        </button>
        <button
          onClick={() => setActiveTab('pillar4')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'pillar4' ? 'bg-blue-700 text-white font-bold' : 'text-slate-600'
          }`}
        >
          4. Marketplace
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-purple-700 text-white font-bold' : 'text-slate-600'
          }`}
        >
          ESG
        </button>
      </div>
    </header>
  );
};
