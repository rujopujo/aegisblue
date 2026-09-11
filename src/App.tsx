import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Pillar4_Marketplace } from './components/Pillar4_Marketplace';
import { EnterpriseDashboard } from './components/EnterpriseDashboard';
import { INITIAL_PROJECTS, INITIAL_ORDERS } from './data/mockProjects';
import { CarbonProject, OffsetOrder, ESGCertificateData } from './types/marketplace';
import { 
  CheckCircle2, 
  GitBranch, 
  Layers, 
  ArrowRight, 
  Flame, 
  FileDown, 
  ExternalLink 
} from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<'MARKETPLACE' | 'DASHBOARD'>('MARKETPLACE');
  const [projects, setProjects] = useState<CarbonProject[]>(INITIAL_PROJECTS);
  const [orders, setOrders] = useState<OffsetOrder[]>(INITIAL_ORDERS);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<OffsetOrder | null>(null);

  // Handle on-chain retirement & credit decrement
  const handleRetirementComplete = (newOrder: OffsetOrder, certificate: ESGCertificateData) => {
    // 1. Decrement available tokens on the specific project (Double-spend prevention)
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === newOrder.projectId) {
          const newAvailable = Math.max(0, p.availableTons - newOrder.tonsRetired);
          return {
            ...p,
            availableTons: newAvailable
          };
        }
        return p;
      })
    );

    // 2. Add order to the auditable corporate ledger
    setOrders((prevOrders) => [newOrder, ...prevOrders]);
    setLastCompletedOrder(newOrder);
  };

  const totalAvailableCredits = projects.reduce((acc, p) => acc + p.availableTons, 0);

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-[#eef2ff] flex flex-col selection:bg-[#00e5ff] selection:text-[#0a0b1e]">
      
      {/* AegisBlue Network & Satellite Status Bar */}
      <div className="bg-[#070814]/90 border-b border-[rgba(99,102,241,0.2)] py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#00e5ff] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse" />
            <span>AegisBlue Network: <strong>Live Telemetry Synced</strong></span>
            <span className="text-[#5b6486]">ΓÇó</span>
            <span className="text-[#94a3c8] hidden sm:inline">ESA Sentinel-2 Multispectral MSI & Smithsonian CCN Cores Active</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#94a3c8]">
            <span className="flex items-center gap-1 text-[#39ff14]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39ff14]" />
              Polygon Amoy (80002) ΓÇó Contract Verified
            </span>
          </div>
        </div>
      </div>

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        availableCredits={totalAvailableCredits}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'MARKETPLACE' ? (
          <Pillar4_Marketplace
            projects={projects}
            orders={orders}
            onRetirementComplete={handleRetirementComplete}
            onNavigateToDashboard={() => setCurrentTab('DASHBOARD')}
          />
        ) : (
          <EnterpriseDashboard
            orders={orders}
            onNavigateToMarketplace={() => setCurrentTab('MARKETPLACE')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[rgba(99,102,241,0.2)] bg-[#0d0e26] py-8 px-4 text-xs text-[#94a3c8]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#eef2ff] font-semibold">
              <span>≡ƒîè AegisBlue ΓÇó Blue Carbon MRV & Tokenization</span>
            </div>
            <p className="mt-1 text-[#5b6486]">
              Decarbonization Platform ΓÇó Smithsonian Coastal Carbon Network Dataset (CCN) & ESA Sentinel-2 Telemetry
            </p>
          </div>

          <div className="flex items-center gap-4 text-[#94a3c8]">
            <span className="text-[#5b6486] text-[11px]">Audited & Verifiable On-Chain Governance</span>
            <a 
              href="https://amoy.polygonscan.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#00e5ff] flex items-center gap-1"
            >
              Polygon Amoy Explorer <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
export default App;
