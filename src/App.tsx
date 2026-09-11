import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BCI_Homepage } from './components/BCI_Homepage';
import { Pillar1_Registration } from './components/Pillar1_Registration';
import { Pillar2_Auditing } from './components/Pillar2_Auditing';
import { Pillar3_Tokenization } from './components/Pillar3_Tokenization';
import { Pillar4_Marketplace } from './components/Pillar4_Marketplace';
import { EnterpriseDashboard } from './components/EnterpriseDashboard';
import { ESGCertificateModal } from './components/ESGCertificateModal';
import { VerificationPage } from './components/VerificationPage';
import { 
  LatLng, 
  BoundaryCheckResult, 
  SatelliteBandData, 
  CarbonAuditMetrics, 
  TokenizedProject, 
  RetirementRecord 
} from './types';
import { initializeMockProjects, INITIAL_RETIREMENTS } from './data/mockProjects';
import { apiFetchProjects, apiSaveProject } from './services/apiClient';
import {
  POLYGON_AMOY_CONFIG,
  checkExistingConnection,
  connectBrowserWallet,
  switchToPolygonAmoy,
  subscribeToWalletEvents,
} from './services/web3Registry';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | 'dashboard'>('home');
  const [verificationCertId, setVerificationCertId] = useState<string | null>(null);

  // Synchronize browser URL route for /verify/:certificateId
  useEffect(() => {
    const handleUrlRoute = () => {
      const pathname = window.location.pathname;
      const match = pathname.match(/^\/verify\/([^/]+)/i);
      if (match && match[1]) {
        setVerificationCertId(decodeURIComponent(match[1]));
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const verifyParam = params.get('verify');
      if (verifyParam) {
        setVerificationCertId(verifyParam);
        return;
      }

      const hash = window.location.hash;
      const hashMatch = hash.match(/^#\/?verify\/([^/]+)/i);
      if (hashMatch && hashMatch[1]) {
        setVerificationCertId(decodeURIComponent(hashMatch[1]));
        return;
      }

      setVerificationCertId(null);
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  const handleNavigateVerify = (certId: string) => {
    setVerificationCertId(certId);
    window.history.pushState({}, '', `/verify/${encodeURIComponent(certId)}`);
  };

  const handleBackFromVerify = () => {
    setVerificationCertId(null);
    window.history.pushState({}, '', '/');
    setActiveTab('dashboard');
  };
  
  // Real Web3 Wallet State
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [chainId, setChainId] = useState<number | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  const [isConnectingWallet, setIsConnectingWallet] = useState<boolean>(false);

  // Multi-Pillar Pipeline State
  const [stage1Project, setStage1Project] = useState<{
    name: string;
    ngoName: string;
    ngoWallet: string;
    ngoRegistrationNo: string;
    locationName: string;
    coordinates: LatLng[];
    areaHectares: number;
    boundaryResult: BoundaryCheckResult;
  } | null>(null);

  const [stage2Audit, setStage2Audit] = useState<{
    spectralData: SatelliteBandData;
    carbonMetrics: CarbonAuditMetrics;
  } | null>(null);

  // Global Project & Retirement Registry
  const [projects, setProjects] = useState<TokenizedProject[]>(() => initializeMockProjects());
  const [retirements, setRetirements] = useState<RetirementRecord[]>(() => INITIAL_RETIREMENTS);

  // Sync with Python FastAPI backend if available
  useEffect(() => {
    const initial = initializeMockProjects();
    apiFetchProjects(initial).then(({ projects: serverProjects, source }) => {
      if (source === 'FASTAPI' && serverProjects && serverProjects.length > 0) {
        setProjects(serverProjects);
      } else if (source === 'FASTAPI' && (!serverProjects || serverProjects.length === 0)) {
        // Seed default projects to backend SQLite database
        initial.forEach((p) => apiSaveProject(p));
      }
    });
  }, []);

  // Non-intrusive existing connection check and MetaMask event listeners
  useEffect(() => {
    checkExistingConnection().then((state) => {
      if (state) {
        setIsWalletConnected(true);
        setWalletAddress(state.address);
        setChainId(state.chainId);
        setIsCorrectNetwork(state.isCorrectNetwork);
      }
    });

    const unsubscribe = subscribeToWalletEvents(
      (accounts) => {
        if (!accounts || accounts.length === 0) {
          setIsWalletConnected(false);
          setWalletAddress('');
          setChainId(null);
        } else {
          setIsWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      },
      (newChainIdHex) => {
        const parsedChainId = parseInt(newChainIdHex, 16);
        setChainId(parsedChainId);
        setIsCorrectNetwork(parsedChainId === POLYGON_AMOY_CONFIG.chainId);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // ESG Certificate Modal State
  const [selectedRetirement, setSelectedRetirement] = useState<RetirementRecord | null>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState<boolean>(false);

  // Real MetaMask Connection Handler
  const handleConnectWallet = async () => {
    if (isWalletConnected && isCorrectNetwork) {
      alert(`Connected to Polygon Amoy Testnet (#${chainId || 80002}) with address:\n${walletAddress}`);
      return;
    }

    if (isWalletConnected && !isCorrectNetwork) {
      try {
        await switchToPolygonAmoy();
        setIsCorrectNetwork(true);
        setChainId(POLYGON_AMOY_CONFIG.chainId);
      } catch (err: any) {
        alert(`Failed to switch network: ${err?.message || err}`);
      }
      return;
    }

    setIsConnectingWallet(true);
    try {
      const state = await connectBrowserWallet();
      setIsWalletConnected(true);
      setWalletAddress(state.address);
      setChainId(state.chainId);
      setIsCorrectNetwork(state.isCorrectNetwork);
    } catch (err: any) {
      // User rejected request error code 4001
      if (err?.code === 4001 || err?.message?.includes('User rejected')) {
        console.warn('[AegisBlue] User rejected wallet connection request.');
      } else {
        alert(err?.message || 'Failed to connect MetaMask wallet.');
      }
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToPolygonAmoy();
      setIsCorrectNetwork(true);
      setChainId(POLYGON_AMOY_CONFIG.chainId);
    } catch (err: any) {
      alert(`Failed to switch network to Polygon Amoy: ${err?.message || err}`);
    }
  };

  // Pipeline transitions
  const handleBoundaryVerified = (projectData: {
    name: string;
    ngoName: string;
    ngoWallet: string;
    ngoRegistrationNo: string;
    locationName: string;
    coordinates: LatLng[];
    areaHectares: number;
    boundaryResult: BoundaryCheckResult;
  }) => {
    setStage1Project(projectData);
    setActiveTab('pillar2'); // Move to Satellite MRV Auditing
  };

  const handleAuditCompleted = (audit: {
    spectralData: SatelliteBandData;
    carbonMetrics: CarbonAuditMetrics;
  }) => {
    setStage2Audit(audit);
    setActiveTab('pillar3'); // Move to Web3 Tokenization
  };

  const handleTokenized = (newProject: TokenizedProject) => {
    setProjects((prev) => [newProject, ...prev]);
    apiSaveProject(newProject);
    setActiveTab('pillar4'); // Move to Marketplace
  };

  const handleRetireCredits = (updatedProject: TokenizedProject, record: RetirementRecord) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    );
    setRetirements((prev) => [record, ...prev]);
    apiSaveProject(updatedProject);
  };

  const handleOpenCertificate = (record: RetirementRecord) => {
    setSelectedRetirement(record);
    setIsCertModalOpen(true);
  };

  // Aggregated Stats
  const totalSequesteredTons = projects.reduce(
    (acc, p) => acc + p.carbonMetrics.projectTotalCO2Tons,
    0
  );
  const totalTokensMinted = projects.reduce(
    (acc, p) => acc + p.tokenization.totalMinted,
    0
  );
  const totalRetiredTons = retirements.reduce(
    (acc, r) => acc + r.tonsRetired,
    0
  );

  // Default fallback project for Pillar 2 & 3 if navigated directly
  const activePillar1Project = stage1Project || {
    name: 'Sundarbans Core Delta Blue Carbon Restoration',
    ngoName: 'Sundarbans Mangrove Climate Alliance (SMCA)',
    ngoWallet: walletAddress || '0x3B88e63F9D661d9a244C3A73Ec5D875F7925e510',
    ngoRegistrationNo: 'WB-NGO-ENV-2024-9941',
    locationName: 'Sundarbans Biosphere Reserve, West Bengal',
    coordinates: [
      [21.88, 88.73],
      [21.88, 88.78],
      [21.93, 88.78],
      [21.93, 88.73],
      [21.88, 88.73],
    ] as LatLng[],
    areaHectares: 380,
    boundaryResult: {
      isValid: true,
      overlapPercentage: 98,
      totalAreaHa: 380,
      warnings: [],
      spatialConfidence: 98.4,
      timestamp: new Date().toISOString(),
      boundingBox: { minLat: 21.88, maxLat: 21.93, minLng: 88.73, maxLng: 88.78 },
    },
  };

  if (verificationCertId) {
    return (
      <VerificationPage
        certificateId={verificationCertId}
        onBackToApp={handleBackFromVerify}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Clean Institutional Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletAddress}
        isWalletConnected={isWalletConnected}
        isCorrectNetwork={isCorrectNetwork}
        isConnectingWallet={isConnectingWallet}
        onConnectWallet={handleConnectWallet}
        onSwitchNetwork={handleSwitchNetwork}
        totalSequesteredTons={totalSequesteredTons}
        totalTokensMinted={totalTokensMinted}
        totalRetiredTons={totalRetiredTons}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <BCI_Homepage
            onLaunchPillar={(pillar) => setActiveTab(pillar)}
            projects={projects}
          />
        )}

        {activeTab === 'pillar1' && (
          <div className="bg-[#F8FAF9] min-h-screen text-slate-800 py-6">
            <Pillar1_Registration onBoundaryVerified={handleBoundaryVerified} />
          </div>
        )}

        {activeTab === 'pillar2' && (
          <div className="bg-[#F8FAF9] min-h-screen text-slate-800 py-6">
            <Pillar2_Auditing
              projectData={activePillar1Project}
              onAuditCompleted={handleAuditCompleted}
            />
          </div>
        )}

        {activeTab === 'pillar3' && (
          <div className="bg-[#F8FAF9] min-h-screen text-slate-800 py-6">
            <Pillar3_Tokenization
              projectData={activePillar1Project}
              auditData={
                stage2Audit || {
                  spectralData: {
                    band2_blue: 0.06,
                    band3_green: 0.18,
                    band4_red: 0.08,
                    band8_nir: 0.58,
                    band11_swir: 0.12,
                    cloudCoverPct: 2.1,
                    acquisitionDate: '2026-08-30',
                    satellite: 'Sentinel-2B',
                  },
                  carbonMetrics: {
                    ndvi: 0.758,
                    evi: 0.692,
                    ndre: 0.667,
                    canopyCoverPct: 87.2,
                    meanTreeHeightM: 13.0,
                    agbTonsPerHa: 98.4,
                    bgbTonsPerHa: 48.2,
                    socTonsPerHa: 20.6,
                    totalCarbonTonsPerHa: 89.5,
                    co2EquivalentPerHa: 328.2,
                    projectTotalCO2Tons: 124716,
                    confidenceScore: 97.8,
                    historicalTrend: [
                      { year: 2022, ndvi: 0.52, co2Tons: 77324 },
                      { year: 2023, ndvi: 0.58, co2Tons: 92290 },
                      { year: 2024, ndvi: 0.64, co2Tons: 107256 },
                      { year: 2025, ndvi: 0.71, co2Tons: 118480 },
                      { year: 2026, ndvi: 0.758, co2Tons: 124716 },
                    ],
                    auditHash: '0xa1f79c4e8832fb91e0a84c2019ef58b9104c8321a084ef77b198c21a0f918e24',
                    auditedAt: new Date().toISOString(),
                  },
                }
              }
              onTokenized={handleTokenized}
            />
          </div>
        )}

        {activeTab === 'pillar4' && (
          <div className="bg-[#F8FAF9] min-h-screen text-slate-800 py-6">
            <Pillar4_Marketplace
              projects={projects}
              onRetireCredits={handleRetireCredits}
              onOpenCertificate={handleOpenCertificate}
              defaultCompanyWallet={walletAddress}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="bg-[#F8FAF9] min-h-screen text-slate-800 py-6">
            <EnterpriseDashboard
              retirements={retirements}
              projects={projects}
              onOpenCertificate={handleOpenCertificate}
              onNavigateVerify={handleNavigateVerify}
            />
          </div>
        )}
      </main>

      {/* ESG Certificate Modal */}
      <ESGCertificateModal
        record={selectedRetirement}
        project={projects.find((p) => p.id === selectedRetirement?.projectId) || null}
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        onNavigateVerify={handleNavigateVerify}
      />

      {/* Institutional Editorial Footer */}
      <footer className="bg-[#002B49] text-white border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="text-base font-black uppercase tracking-wider text-white">
                The Blue Carbon Initiative
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Coordinated global program dedicated to mitigating climate change through the conservation and restoration of coastal marine ecosystems.
              </p>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">
                MRV & Technology
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li><button onClick={() => setActiveTab('pillar1')} className="hover:text-emerald-400">1. Boundary Gatekeeper</button></li>
                <li><button onClick={() => setActiveTab('pillar2')} className="hover:text-cyan-400">2. Sentinel-2 Satellite MRV</button></li>
                <li><button onClick={() => setActiveTab('pillar3')} className="hover:text-teal-400">3. Web3 Tokenization</button></li>
                <li><button onClick={() => setActiveTab('pillar4')} className="hover:text-blue-400">4. Net-Zero Marketplace</button></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">
                Scientific Standards
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li><span>IPCC Wetlands Supplement (2013)</span></li>
                <li><span>Global Mangrove Watch (GMW v3.0)</span></li>
                <li><span>Copernicus Sentinel-2 L2A Telemetry</span></li>
                <li><span>SEBI BRSR & SEC ESG Audit Proofs</span></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">
                Co-Organizers
              </div>
              <ul className="space-y-1.5 text-slate-300">
                <li><span>Conservation International (CI)</span></li>
                <li><span>IUCN Blue Carbon Program</span></li>
                <li><span>IOC-UNESCO Ocean Science</span></li>
                <li><span>Polygon Amoy EVM Protocol</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-mono">
            <div>© {new Date().getFullYear()} The Blue Carbon Initiative. All rights reserved.</div>
            <div className="flex items-center space-x-4">
              <span>Polygon Amoy #80002</span>
              <span>•</span>
              <span>IPFS CID Verification</span>
              <span>•</span>
              <span>Zero-Greenwashing Proof of Burn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
