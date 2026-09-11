import React from 'react';
import { 
  Waves, 
  Store, 
  BarChart3, 
  Wallet, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'MARKETPLACE' | 'DASHBOARD';
  setCurrentTab: (tab: 'MARKETPLACE' | 'DASHBOARD') => void;
  availableCredits: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  availableCredits
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(99,102,241,0.18)] bg-[#0a0b1e]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Platform Name */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#00e5ff] via-[#3d7aff] to-[#a855f7] p-[1.5px] shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-[#0d0e24] rounded-2xl flex items-center justify-center">
                <Waves className="w-6 h-6 text-[#00e5ff]" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00e5ff]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#eef2ff] text-xl tracking-tight uppercase" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                Team Carbon
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/30 shadow-[0_0_8px_rgba(0,229,255,0.2)]">
                PILLAR 4
              </span>
            </div>
            <p className="text-[11px] text-[#94a3c8] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#39ff14]" />
              Blue Carbon MRV & Tokenization Marketplace
            </p>
          </div>
        </div>

        {/* Center Nav Switcher (Gaming Pill Layout) */}
        <nav className="hidden md:flex items-center bg-[#10122e] p-1.5 rounded-2xl border border-[rgba(99,102,241,0.25)] shadow-inner">
          <button
            onClick={() => setCurrentTab('MARKETPLACE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              currentTab === 'MARKETPLACE'
                ? 'bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] text-[#0a0b1e] shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-[1.02]'
                : 'text-[#94a3c8] hover:text-[#eef2ff] hover:bg-[#191a40]'
            }`}
          >
            <Store className="w-4 h-4" />
            Carbon Marketplace
          </button>

          <button
            onClick={() => setCurrentTab('DASHBOARD')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              currentTab === 'DASHBOARD'
                ? 'bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] text-[#0a0b1e] shadow-[0_0_20px_rgba(0,229,255,0.4)] scale-[1.02]'
                : 'text-[#94a3c8] hover:text-[#eef2ff] hover:bg-[#191a40]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            ESG Dashboard
          </button>
        </nav>

        {/* Right Info & Web3 Status */}
        <div className="flex items-center space-x-3">
          {/* Credits remaining indicator */}
          <div className="hidden lg:flex flex-col text-right px-3 py-1.5 rounded-xl bg-[#141538] border border-[rgba(99,102,241,0.2)]">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#94a3c8]">Total Pool Supply</span>
            <span className="text-xs font-mono font-black text-[#00e5ff]">
              {availableCredits.toLocaleString()} <span className="text-[10px] text-[#94a3c8] font-normal">tCO2e</span>
            </span>
          </div>

          {/* Web3 Polygon Amoy Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141538] border border-[#a855f7]/40 text-xs text-[#eef2ff] shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#a855f7] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#a855f7]"></span>
            </span>
            <Wallet className="w-3.5 h-3.5 text-[#a855f7]" />
            <span className="font-mono text-[11px] font-semibold hidden sm:inline">Polygon Amoy (80002)</span>
          </div>
        </div>

      </div>

      {/* Mobile Tab Bar */}
      <div className="flex md:hidden border-t border-[rgba(99,102,241,0.2)] p-2 bg-[#0d0e24]">
        <button
          onClick={() => setCurrentTab('MARKETPLACE')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            currentTab === 'MARKETPLACE' 
              ? 'bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] text-[#0a0b1e] shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
              : 'text-[#94a3c8]'
          }`}
        >
          <Store className="w-4 h-4" />
          Marketplace
        </button>
        <button
          onClick={() => setCurrentTab('DASHBOARD')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
            currentTab === 'DASHBOARD' 
              ? 'bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] text-[#0a0b1e] shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
              : 'text-[#94a3c8]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          ESG Dashboard
        </button>
      </div>
    </header>
  );
};
