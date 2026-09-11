import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Flame, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Loader2, 
  TreePine, 
  PlaneTakeoff, 
  Building2, 
  FileText,
  Sparkles,
  Lock,
  Award,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CarbonProject, ESGCertificateData, OffsetOrder } from '../types/marketplace';
import { downloadESGCertificate } from '../services/certificateGenerator';

interface ESGCertificateModalProps {
  project: CarbonProject | null;
  isOpen: boolean;
  onClose: () => void;
  onRetirementComplete: (order: OffsetOrder, certificate: ESGCertificateData) => void;
}

export const ESGCertificateModal: React.FC<ESGCertificateModalProps> = ({
  project,
  isOpen,
  onClose,
  onRetirementComplete
}) => {
  if (!isOpen || !project) return null;

  const [step, setStep] = useState<'INPUT' | 'BURNING' | 'SUCCESS'>('INPUT');
  const [tons, setTons] = useState<number>(Math.min(500, project.availableTons));
  const [companyName, setCompanyName] = useState('Tata Steel Sustainability Group');
  const [signatoryName, setSignatoryName] = useState('Dr. Rajesh Mukherjee');
  const [corporateEmail, setCorporateEmail] = useState('r.mukherjee@tatasteel.com');
  const [esgPurpose, setEsgPurpose] = useState('Scope 1 & 2 Industrial Decarbonization');
  
  const [generatedCertificate, setGeneratedCertificate] = useState<ESGCertificateData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Calculations
  const subtotal = tons * project.pricePerTon;
  const platformFee = Math.round(subtotal * 0.01);
  const totalAmount = subtotal + platformFee;
  const treesEquiv = Math.round(tons * 5);
  const flightsEquiv = Math.round(tons * 0.85);

  const handleRetireAndBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tons <= 0 || tons > project.availableTons) return;

    setStep('BURNING');

    // Simulate real on-chain transaction burn latency on Polygon Amoy testnet
    await new Promise((resolve) => setTimeout(resolve, 2200));

    // Generate random realistic Polygon Tx Hash
    const randomHex = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const burnTxHash = `0x${randomHex}`;
    const certNumber = Math.floor(100000 + Math.random() * 900000);
    const certId = `ESG-2026-BC-${certNumber}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    const certData: ESGCertificateData = {
      certificateId: certId,
      orderId: `ORD-2026-${certNumber}`,
      companyName,
      authorizedSignatory: signatoryName,
      corporateEmail,
      tonsRetired: tons,
      projectName: project.name,
      projectRegion: `${project.region}, ${project.state}`,
      ecosystemType: project.ecosystemType,
      polygonBurnTxHash: burnTxHash,
      polygonTokenId: project.polygonTokenId,
      ipfsDossierCid: project.ipfsDossierCid,
      issuanceDate: nowStr,
      verificationUrl: `https://amoy.polygonscan.com/tx/${burnTxHash}`,
      environmentalImpact: {
        treesEquivalent: treesEquiv,
        flightMilesOffset: flightsEquiv,
        carsOffRoadDays: Math.round(tons * 2.2)
      }
    };

    const newOrder: OffsetOrder = {
      orderId: `ORD-2026-${certNumber}`,
      projectId: project.id,
      projectName: project.name,
      buyerCompany: companyName,
      signatoryName,
      corporateEmail,
      tonsRetired: tons,
      pricePerTon: project.pricePerTon,
      subtotal,
      platformFee,
      totalAmount,
      esgPurpose,
      retirementDate: nowStr,
      polygonBurnTxHash: burnTxHash,
      certificateId: certId,
      status: 'CONFIRMED'
    };

    setGeneratedCertificate(certData);
    setStep('SUCCESS');
    onRetirementComplete(newOrder, certData);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedCertificate) return;
    setIsDownloading(true);
    try {
      await downloadESGCertificate(generatedCertificate);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const resetAndClose = () => {
    setStep('INPUT');
    setGeneratedCertificate(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#070814]/85 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#141538] to-[#0d0e26] border border-[rgba(0,229,255,0.3)] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden my-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(99,102,241,0.2)] bg-[#101230]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00e5ff] to-[#3d7aff] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.3)]">
              {step === 'SUCCESS' ? (
                <Award className="w-5 h-5 text-[#0a0b1e]" />
              ) : (
                <Flame className="w-5 h-5 text-[#0a0b1e]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#eef2ff] flex items-center gap-2" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.5px' }}>
                {step === 'SUCCESS' ? 'OFFICIAL ESG CERTIFICATE READY' : 'RETIRE & BURN BLUE CARBON CREDITS'}
              </h2>
              <p className="text-[11px] text-[#94a3c8]">
                {project.name} ΓÇó Polygon Amoy Proof-of-Burn
              </p>
            </div>
          </div>

          <button
            onClick={resetAndClose}
            className="w-8 h-8 rounded-lg bg-[#191a40] hover:bg-[#222456] border border-[rgba(99,102,241,0.2)] flex items-center justify-center text-[#94a3c8] hover:text-[#eef2ff] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: STEP 1 - INPUT FORM */}
        {step === 'INPUT' && (
          <form onSubmit={handleRetireAndBurn} className="p-6 md:p-8 space-y-6">
            
            {/* Project Overview Card */}
            <div className="p-4 rounded-2xl bg-[#0f1029] border border-[rgba(99,102,241,0.2)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#00e5ff] uppercase px-2 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/20">
                  {project.code}
                </span>
                <h3 className="text-base font-bold text-[#eef2ff] mt-1">{project.name}</h3>
                <p className="text-xs text-[#94a3c8]">{project.ecosystemType} ΓÇó {project.region}, {project.state}</p>
              </div>
              <div className="sm:text-right">
                <div className="text-xs text-[#94a3c8]">Market Price / tCO2e</div>
                <div className="text-2xl font-black text-[#00e5ff] font-mono">
                  ${project.pricePerTon.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Slider / Tons Selector */}
            <div className="space-y-2 p-5 rounded-2xl bg-[#0f1029] border border-[rgba(99,102,241,0.2)]">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-[#eef2ff] flex items-center gap-2">
                  Tons of CO2 to Retire (Permanently Burn)
                  <span className="text-[10px] text-[#00e5ff] bg-[#00e5ff]/10 px-2 py-0.5 rounded border border-[#00e5ff]/30 font-mono">
                    1 Token = 1 Metric Ton
                  </span>
                </label>
                <span className="text-xs font-mono text-[#94a3c8]">
                  Available: {project.availableTons.toLocaleString()} t
                </span>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <input
                  type="range"
                  min="1"
                  max={Math.min(50000, project.availableTons)}
                  value={tons}
                  onChange={(e) => setTons(Math.max(1, Number(e.target.value)))}
                  className="flex-1 accent-[#00e5ff] h-2 bg-[#191a40] rounded-lg cursor-pointer"
                />
                <div className="relative w-36">
                  <input
                    type="number"
                    min="1"
                    max={project.availableTons}
                    value={tons}
                    onChange={(e) => setTons(Math.min(project.availableTons, Math.max(1, Number(e.target.value))))}
                    className="w-full bg-[#141538] border border-[rgba(0,229,255,0.3)] rounded-xl px-3 py-2 text-right font-mono text-[#00e5ff] font-bold text-sm focus:outline-none focus:border-[#00e5ff]"
                  />
                  <span className="absolute right-9 top-2.5 text-xs text-[#94a3c8] pointer-events-none">t</span>
                </div>
              </div>

              {/* Quick Pick Presets */}
              <div className="flex gap-2 pt-2">
                {[100, 500, 1500, 5000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTons(Math.min(preset, project.availableTons))}
                    className={`text-xs px-3 py-1 rounded-lg border font-mono transition-all ${
                      tons === preset 
                        ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]' 
                        : 'bg-[#141538] border-[rgba(99,102,241,0.2)] text-[#94a3c8] hover:text-[#eef2ff]'
                    }`}
                  >
                    {preset.toLocaleString()} t
                  </button>
                ))}
              </div>
            </div>

            {/* Corporate Buyer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#eef2ff] mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#00e5ff]" />
                  Corporate Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Tata Steel Sustainability Group"
                  className="w-full bg-[#0f1029] border border-[rgba(99,102,241,0.25)] rounded-xl px-3.5 py-2.5 text-xs text-[#eef2ff] focus:outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#eef2ff] mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00e5ff]" />
                  Authorized Signatory Name
                </label>
                <input
                  type="text"
                  required
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Mukherjee"
                  className="w-full bg-[#0f1029] border border-[rgba(99,102,241,0.25)] rounded-xl px-3.5 py-2.5 text-xs text-[#eef2ff] focus:outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#eef2ff] mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={corporateEmail}
                  onChange={(e) => setCorporateEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#0f1029] border border-[rgba(99,102,241,0.25)] rounded-xl px-3.5 py-2.5 text-xs text-[#eef2ff] focus:outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#eef2ff] mb-1.5">
                  ESG / Climate Target Purpose
                </label>
                <input
                  type="text"
                  required
                  value={esgPurpose}
                  onChange={(e) => setEsgPurpose(e.target.value)}
                  placeholder="e.g. Scope 1 Net-Zero Offset"
                  className="w-full bg-[#0f1029] border border-[rgba(99,102,241,0.25)] rounded-xl px-3.5 py-2.5 text-xs text-[#eef2ff] focus:outline-none focus:border-[#00e5ff] transition-all"
                />
              </div>
            </div>

            {/* Environmental Impact Metrics */}
            <div className="p-4 rounded-2xl bg-[#0f1029] border border-[rgba(99,102,241,0.2)] grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/20">
                  <TreePine className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-[#39ff14]">~{treesEquiv.toLocaleString()}</div>
                  <div className="text-[11px] text-[#94a3c8]">Trees Equiv. Conserved</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/20">
                  <PlaneTakeoff className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-base font-bold text-[#00e5ff]">~{flightsEquiv.toLocaleString()} hrs</div>
                  <div className="text-[11px] text-[#94a3c8]">Flight Emissions Offset</div>
                </div>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="p-4 rounded-2xl bg-[#101230] border border-[rgba(0,229,255,0.2)] flex items-center justify-between">
              <div>
                <div className="text-xs text-[#94a3c8]">Total Investment</div>
                <div className="text-2xl font-black text-[#eef2ff] font-mono">
                  ${totalAmount.toLocaleString()} <span className="text-xs text-[#94a3c8] font-sans font-normal">USD</span>
                </div>
              </div>
              <div className="text-right text-xs text-[#94a3c8]">
                <div>Subtotal: ${subtotal.toLocaleString()}</div>
                <div>Registry Fee (1%): ${platformFee.toLocaleString()}</div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00e5ff] via-[#3d7aff] to-[#00e5ff] hover:from-[#00c6ff] hover:to-[#3d7aff] text-[#0a0b1e] font-extrabold text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,229,255,0.35)] flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Flame className="w-4 h-4" />
              Confirm & Burn On Polygon ({tons.toLocaleString()} Tokens)
            </button>

            <p className="text-[11px] text-center text-[#5b6486] flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-[#5b6486]" />
              Permanent on-chain burn on Polygon Amoy testnet. Double-spending mathematically impossible.
            </p>
          </form>
        )}

        {/* Modal Body: STEP 2 - BURNING IN PROGRESS */}
        {step === 'BURNING' && (
          <div className="p-12 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#00e5ff]/20 border-t-[#00e5ff] animate-spin" />
              <Flame className="w-10 h-10 text-[#00e5ff] animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#eef2ff]" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                EXECUTING ON-CHAIN TOKEN BURN...
              </h3>
              <p className="text-xs text-[#94a3c8] max-w-sm mx-auto">
                Invoking Polygon Smart Contract burn method for {tons.toLocaleString()} AegisCarbon tokens. 
                Minting official cryptographic ESG Certificate of Recognition.
              </p>
            </div>

            <div className="p-4 max-w-md mx-auto rounded-2xl bg-[#0f1029] border border-[rgba(99,102,241,0.25)] font-mono text-[11px] text-[#94a3c8] text-left space-y-1.5">
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="text-[#00e5ff] font-semibold">Polygon Amoy Testnet (Chain ID 80002)</span>
              </div>
              <div className="flex justify-between">
                <span>Contract:</span>
                <span className="text-[#eef2ff] truncate max-w-[200px]">{project.polygonContractAddress}</span>
              </div>
              <div className="flex justify-between">
                <span>Action:</span>
                <span className="text-[#39ff14]">burn(tokenId, {tons})</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body: STEP 3 - SUCCESS & CERTIFICATE DISPLAY (MATCHING REFERENCE IMAGE) */}
        {step === 'SUCCESS' && generatedCertificate && (
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Top Success Banner */}
            <div className="p-4 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00e5ff]/20 border border-[#00e5ff]/40 flex items-center justify-center text-[#00e5ff]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#eef2ff] flex items-center gap-2">
                  Retirement Complete & Recorded On-Chain!
                  <Sparkles className="w-4 h-4 text-[#00e5ff]" />
                </h3>
                <p className="text-xs text-[#94a3c8]">
                  {tons.toLocaleString()} tCO2e permanently burned. Official Certificate of Recognition issued.
                </p>
              </div>
            </div>

            {/* HIGH-FIDELITY VISUAL CERTIFICATE PREVIEW MIRRORING REFERENCE IMAGE */}
            <div className="relative rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden text-center select-none"
              style={{
                backgroundColor: '#FAF6EC',
                color: '#2b2316',
                border: '8px double #C5A059',
                boxShadow: '0 10px 40px rgba(0,0,0,0.6)'
              }}
            >
              {/* Inner Ornamental Border */}
              <div className="absolute inset-2 border border-[#C5A059]/60 pointer-events-none rounded-lg" />
              <div className="absolute inset-3 border border-[#997328]/30 pointer-events-none rounded-lg" />

              {/* Corner Scroll Flourishes */}
              <div className="absolute top-4 left-4 text-[#C5A059] text-xl select-none">Γ¥º</div>
              <div className="absolute top-4 right-4 text-[#C5A059] text-xl select-none">ΓÿÖ</div>
              <div className="absolute bottom-4 left-4 text-[#C5A059] text-xl select-none">Γ¥º</div>
              <div className="absolute bottom-4 right-4 text-[#C5A059] text-xl select-none">ΓÿÖ</div>

              {/* Top Golden Ribbon Banner */}
              <div className="inline-block relative px-8 py-1.5 mb-3 rounded shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #c5a059, #dfbe78, #b8860b)',
                  color: '#ffffff',
                  border: '1px solid #997328'
                }}
              >
                <span className="font-serif font-bold text-xs uppercase tracking-widest text-white drop-shadow-sm">
                  National Blue Carbon Registry
                </span>
              </div>

              {/* Certificate Main Title */}
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
                Verified Carbon Offset Retirement & ESG Compliance
              </p>

              {/* Ornamental Divider: ΓöÇΓöÇΓöÇ ΓÇóΓÇóΓÇó ΓöÇΓöÇΓöÇ */}
              <div className="flex items-center justify-center gap-2 my-2 text-[#C5A059]">
                <div className="w-16 h-[1px] bg-[#C5A059]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#9E7724]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                <div className="w-16 h-[1px] bg-[#C5A059]" />
              </div>

              {/* Presented To Label */}
              <p className="text-[10px] uppercase tracking-widest text-[#6B5738] font-serif mt-2">
                This Certificate is Proudly Presented To
              </p>

              {/* Recipient Corporate Name in Calligraphy Style */}
              <div className="my-2">
                <span 
                  className="text-3xl md:text-4xl text-[#231E14] drop-shadow-sm block leading-tight"
                  style={{
                    fontFamily: 'Great Vibes, cursive',
                    letterSpacing: '1px'
                  }}
                >
                  {generatedCertificate.companyName}
                </span>
                <div className="w-48 h-[1px] bg-[#C5A059] mx-auto mt-1" />
              </div>

              {/* Body Text */}
              <p className="text-xs italic text-[#4A3C26] font-serif max-w-xl mx-auto leading-relaxed my-3">
                For the permanent, verified retirement of <strong className="font-bold text-[#8C641E] not-italic">{generatedCertificate.tonsRetired.toLocaleString()} Metric Tonnes of CO2e</strong> from global atmospheric circulation. Sourced from <span className="font-semibold not-italic">{generatedCertificate.projectName}</span>, audited via Sentinel-2 Multispectral satellite telemetry and permanently burned on the Polygon Amoy blockchain ledger.
              </p>

              {/* Golden Embossed Seal & Serial Box */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-[#C5A059]/40 text-left">
                
                {/* Date on Left */}
                <div className="text-center sm:text-left">
                  <div className="font-serif font-bold text-sm text-[#231E14]">
                    {generatedCertificate.issuanceDate.split(' ')[0].replace(/-/g, '.')}
                  </div>
                  <div className="w-24 h-[1px] bg-[#231E14] my-1" />
                  <div className="text-[10px] uppercase font-serif text-[#6B5738]">Date</div>
                </div>

                {/* Circular Golden Security Seal in Center */}
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

                  {/* Serial Box [ No. 000000 ] */}
                  <div className="mt-2 px-3 py-0.5 bg-white border border-[#C5A059] rounded text-[10px] font-mono text-[#231E14] font-bold">
                    No. {generatedCertificate.certificateId.replace('ESG-2026-BC-', '')}
                  </div>
                </div>

                {/* Signature on Right */}
                <div className="text-center sm:text-right">
                  <div className="font-serif italic font-bold text-sm text-[#231E14]" style={{ fontFamily: 'Great Vibes, cursive', fontSize: '18px' }}>
                    Dr. Aris Thorne
                  </div>
                  <div className="w-28 h-[1px] bg-[#231E14] my-1 sm:ml-auto" />
                  <div className="text-[10px] uppercase font-serif text-[#6B5738]">Director / Lead Auditor</div>
                </div>

              </div>

            </div>

            {/* On-Chain Ledger Proof Links */}
            <div className="p-4 rounded-2xl bg-[#0f1029] border border-[rgba(99,102,241,0.2)] grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#94a3c8] text-[11px]">Polygon Amoy Burn Tx:</span>
                <a 
                  href={generatedCertificate.verificationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block font-mono text-[#00e5ff] hover:underline truncate mt-0.5"
                >
                  {generatedCertificate.polygonBurnTxHash}
                </a>
              </div>
              <div>
                <span className="text-[#94a3c8] text-[11px]">IPFS MRV Audit CID:</span>
                <a 
                  href={`https://ipfs.io/ipfs/${generatedCertificate.ipfsDossierCid}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="block font-mono text-[#a855f7] hover:underline truncate mt-0.5"
                >
                  {generatedCertificate.ipfsDossierCid}
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#00e5ff] to-[#3d7aff] hover:from-[#00c6ff] hover:to-[#3d7aff] text-[#0a0b1e] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Official ESG PDF Certificate
                  </>
                )}
              </button>

              <a
                href={generatedCertificate.verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3.5 px-5 rounded-2xl bg-[#141538] hover:bg-[#191a40] border border-[rgba(99,102,241,0.3)] text-[#eef2ff] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-[#94a3c8]" />
                PolygonScan
              </a>
            </div>

            <div className="text-center">
              <button
                onClick={resetAndClose}
                className="text-xs text-[#94a3c8] hover:text-[#00e5ff] transition-colors"
              >
                ΓåÉ Done & Return to Marketplace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
