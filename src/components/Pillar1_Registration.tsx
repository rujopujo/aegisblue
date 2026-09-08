import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Info,
  Radar,
  Building2,
  Trees,
  Crosshair
} from 'lucide-react';
import { LatLng, BoundaryCheckResult, PresetLocation } from '../types';
import { PRESET_LOCATIONS } from '../data/gmwBoundaries';
import { apiValidateBoundary } from '../services/apiClient';
import { MapComponent } from './MapComponent';

interface Pillar1RegistrationProps {
  onBoundaryVerified: (projectData: {
    name: string;
    ngoName: string;
    ngoWallet: string;
    ngoRegistrationNo: string;
    locationName: string;
    coordinates: LatLng[];
    areaHectares: number;
    boundaryResult: BoundaryCheckResult;
  }) => void;
}

export const Pillar1_Registration: React.FC<Pillar1RegistrationProps> = ({
  onBoundaryVerified,
}) => {
  // Form State
  const [projectName, setProjectName] = useState('Sundarbans Lothian Island Blue Carbon Sanctuary');
  const [ngoName, setNgoName] = useState('Sundarbans Coastal Climate Action Alliance');
  const [ngoWallet, setNgoWallet] = useState('0x71C...9E34');
  const [ngoRegNo, setNgoRegNo] = useState('WB-ENV-NGO-2024-8199');
  const [areaHectares, setAreaHectares] = useState<number>(320);

  // Selected Coordinates and Presets
  const [currentCoords, setCurrentCoords] = useState<LatLng[]>([
    [21.88, 88.73],
    [21.88, 88.78],
    [21.93, 88.78],
    [21.93, 88.73],
    [21.88, 88.73]
  ]);
  const [selectedPreset, setSelectedPreset] = useState<string>('PRESET-SUN-01');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [boundaryResult, setBoundaryResult] = useState<BoundaryCheckResult | null>(null);
  const [engineSource, setEngineSource] = useState<'FASTAPI' | 'CLIENT_FALLBACK' | null>(null);

  // Quick preset loader
  const handleSelectPreset = (preset: PresetLocation) => {
    setSelectedPreset(preset.id);
    setCurrentCoords(preset.polygon.length > 0 ? preset.polygon : [preset.coordinates]);
    setBoundaryResult(null); // Reset check to let user trigger or test gatekeeper
    setEngineSource(null);
    
    if (preset.type === 'mangrove') {
      setProjectName(`${preset.name} Blue Carbon Initiative`);
      setAreaHectares(280);
    } else if (preset.type === 'urban') {
      setProjectName(`[Fraud Test] ${preset.name} Highrise Carbon Scheme`);
      setAreaHectares(45);
    } else if (preset.type === 'desert') {
      setProjectName(`[Fraud Test] ${preset.name} Desert Offset`);
      setAreaHectares(500);
    }
  };

  // Click on map to pin coordinates
  const handleMapClick = (latlng: LatLng) => {
    const square: LatLng[] = [
      [latlng[0] - 0.01, latlng[1] - 0.01],
      [latlng[0] - 0.01, latlng[1] + 0.01],
      [latlng[0] + 0.01, latlng[1] + 0.01],
      [latlng[0] + 0.01, latlng[1] - 0.01],
      [latlng[0] - 0.01, latlng[1] - 0.01],
    ];
    setCurrentCoords(square);
    setSelectedPreset('');
    setBoundaryResult(null);
    setEngineSource(null);
  };

  // Run Spatial Gatekeeper Verification
  const runGatekeeperCheck = async () => {
    setIsChecking(true);
    const { result, source } = await apiValidateBoundary(currentCoords);
    setBoundaryResult(result);
    setEngineSource(source);
    setIsChecking(false);
  };

  const handleProceedToAuditing = () => {
    if (!boundaryResult || !boundaryResult.isValid) return;

    onBoundaryVerified({
      name: projectName,
      ngoName,
      ngoWallet,
      ngoRegistrationNo: ngoRegNo,
      locationName: boundaryResult.matchedGmwZone?.name || 'Verified Mangrove Zone',
      coordinates: currentCoords,
      areaHectares: areaHectares || boundaryResult.totalAreaHa,
      boundaryResult,
    });
  };

  const centerPoint: LatLng = currentCoords[0] || [21.90, 88.75];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pillar 1 Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#022c22] border border-emerald-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Pillar 1: Anti-Fraud Boundary Gatekeeper</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Project Registration & Global Mangrove Watch Spatial Check
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate fraudulent greenwashing at the gate. Pin project GPS boundaries and let our automated spatial engine verify coordinates against the official <span className="text-emerald-400 font-semibold">Global Mangrove Watch (GMW v3.0)</span> dataset. Non-mangrove urban skyscrapers or desert dunes are rejected immediately.
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden md:block pointer-events-none">
          <Radar className="w-64 h-64 text-emerald-400 animate-spin" style={{ animationDuration: '20s' }} />
        </div>
      </div>

      {/* Preset Test Case Selector (Test Genuine Mangroves vs Anti-Fraud Scenarios) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Quick Test Presets (Verify Mangroves vs Anti-Fraud Gatekeeper)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click any preset to simulate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            const isMangrove = preset.type === 'mangrove';

            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-4 rounded-xl transition-all duration-200 border flex flex-col justify-between ${
                  isSelected
                    ? isMangrove
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'bg-red-950/60 border-red-400 shadow-lg shadow-red-500/10'
                    : 'bg-ocean-900/60 hover:bg-ocean-850 border-ocean-800 hover:border-ocean-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded flex items-center space-x-1 ${
                      isMangrove 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}>
                      {isMangrove ? <Trees className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      <span>{isMangrove ? 'Genuine Mangrove' : 'Fraud Case Test'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{preset.region}</span>
                  </div>
                  <h4 className="font-semibold text-slate-100 text-sm">{preset.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{preset.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-ocean-800 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">
                    [{preset.coordinates[0].toFixed(2)}, {preset.coordinates[1].toFixed(2)}]
                  </span>
                  <span className={`font-bold ${isMangrove ? 'text-emerald-400' : 'text-red-400'}`}>
                    Expected: {preset.expectedResult}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form & Interactive GIS Map Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Project & NGO Metadata */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center space-x-2 border-b border-ocean-800 pb-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">NGO Registration & Site Metadata</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">NGO / Trust Name</label>
                  <input
                    type="text"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">NGO Reg Number</label>
                  <input
                    type="text"
                    value={ngoRegNo}
                    onChange={(e) => setNgoRegNo(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Area (Hectares)</label>
                  <input
                    type="number"
                    value={areaHectares}
                    onChange={(e) => setAreaHectares(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Beneficiary Wallet</label>
                  <input
                    type="text"
                    value={ngoWallet}
                    onChange={(e) => setNgoWallet(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-ocean-950 border border-ocean-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              {/* Coordinates Preview */}
              <div className="bg-ocean-950/80 p-3 rounded-xl border border-ocean-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>Pinned Centroid Coordinates:</span>
                  <span className="text-cyan-400 font-bold">
                    {currentCoords[0] ? `${currentCoords[0][0].toFixed(4)}°N, ${currentCoords[0][1].toFixed(4)}°E` : 'None'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Click on map or load presets to pin GPS polygon vertices.
                </div>
              </div>

              {/* Trigger Gatekeeper Button */}
              <button
                onClick={runGatekeeperCheck}
                disabled={isChecking}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all duration-200 disabled:opacity-50"
              >
                {isChecking ? (
                  <>
                    <Radar className="w-4 h-4 animate-spin text-white" />
                    <span>Cross-Referencing Global Mangrove Watch Dataset...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-white" />
                    <span>Run Anti-Fraud Gatekeeper Check</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Gatekeeper Result Box */}
          {boundaryResult && (
            <div className={`p-5 rounded-2xl transition-all duration-300 ${
              boundaryResult.isValid ? 'glass-panel-glow' : 'glass-panel-red'
            }`}>
              <div className="flex items-start space-x-3">
                {boundaryResult.isValid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm ${
                      boundaryResult.isValid ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      {boundaryResult.isValid ? 'GATEKEEPER APPROVED' : 'GATEKEEPER REJECTION: FRAUD DETECTED'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      boundaryResult.isValid ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {boundaryResult.overlapPercentage}% GMW Overlap
                    </span>
                  </div>

                  {engineSource && (
                    <div className="flex items-center space-x-2 text-[10px] font-mono">
                      {engineSource === 'FASTAPI' ? (
                        <span className="inline-flex items-center text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                          ⚡ Verified by Python FastAPI (Shapely GMW Gatekeeper)
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                          🛡️ Verified by Client-Side Spatial Engine
                        </span>
                      )}
                    </div>
                  )}

                  {boundaryResult.isValid ? (
                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p>
                        Coordinates sit securely within verified coastal mangrove habitat: <span className="text-emerald-400 font-semibold">{boundaryResult.matchedGmwZone?.name}</span>.
                      </p>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-400 font-mono">
                        <span>Spatial Confidence: <strong className="text-emerald-400">{boundaryResult.spatialConfidence}%</strong></span>
                        <span>Biome: <strong className="text-cyan-300">Intertidal Saline Wetland</strong></span>
                      </div>

                      {/* Smithsonian CCN Soil Core Ground Truth Match */}
                      {boundaryResult.nearestCcnCore && (
                        <div className="mt-2 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-cyan-300 font-bold">
                            <span>🏛️ Smithsonian Coastal Carbon Network (CCN) Match</span>
                            <span className="font-mono text-[10px] text-cyan-400 bg-cyan-900/60 px-2 py-0.5 rounded">
                              {boundaryResult.nearestCcnCore.distanceKm} km away
                            </span>
                          </div>
                          <div className="text-slate-200">
                            Station: <span className="font-semibold text-white">{boundaryResult.nearestCcnCore.stationName}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 text-[10px] font-mono text-slate-400 pt-0.5">
                            <span>Core ID: <strong className="text-cyan-300">{boundaryResult.nearestCcnCore.coreId}</strong></span>
                            <span>Ground-Truth Soil Stock: <strong className="text-emerald-400">{boundaryResult.nearestCcnCore.soilCarbonStock_tC_ha} t C/ha</strong></span>
                            <span>Depth: {boundaryResult.nearestCcnCore.samplingDepthCm} cm</span>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={handleProceedToAuditing}
                        className="mt-3 w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-ocean-950 font-extrabold text-xs flex items-center justify-center space-x-2 transition-colors shadow-md shadow-emerald-500/20"
                      >
                        <span>Proceed to Stage 2: Sentinel-2 Satellite MRV Audit</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-300 space-y-2">
                      <p className="text-red-200 font-medium">
                        {boundaryResult.rejectionReason}
                      </p>
                      <div className="bg-red-950/60 p-2.5 rounded-lg border border-red-500/30 text-[11px] text-red-300">
                        🚫 <span className="font-semibold">Anti-Fraud Enforcement:</span> Project cannot be registered or minted into carbon tokens. No scientific MRV will be triggered for non-mangrove biomes.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Interactive GIS Map */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-slate-200">
                Live High-Res Satellite GIS Map
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Esri World Imagery + GMW v3.0 Polygons
            </span>
          </div>

          <MapComponent
            center={centerPoint}
            zoom={boundaryResult?.isValid ? 11 : 10}
            projectCoords={currentCoords}
            isValidBoundary={boundaryResult ? boundaryResult.isValid : null}
            onSelectCoordinates={handleMapClick}
            selectedGmwZoneId={boundaryResult?.matchedGmwZone?.id}
            heightClass="h-[520px]"
            projectName={projectName}
          />

          {/* GMW Legend & Reference Info */}
          <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Verified coastal mangrove polygons are rendered in <strong className="text-emerald-400">glowing emerald</strong>.
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-300">
              6 Active Indian Coastal Zones Loaded (Sundarbans, Pichavaram, Bhitarkanika, Coringa, Baratang, Kutch)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
