import React, { useState, useMemo } from 'react';
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
  Crosshair,
  PenTool,
  RotateCcw,
  Trash2,
  Lock,
  Compass,
  Plus
} from 'lucide-react';
import { LatLng, BoundaryCheckResult, PresetLocation } from '../types';
import { PRESET_LOCATIONS } from '../data/gmwBoundaries';
import { apiValidateBoundary } from '../services/apiClient';
import { 
  calculatePolygonAreaHa, 
  calculatePolygonPerimeterKm, 
  calculatePolylineLengthKm 
} from '../services/spatialValidator';
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

const MANGROVE_REGION_BOOKMARKS = [
  { name: 'Sundarbans Biosphere (WB)', center: [21.88, 88.75] as LatLng, zoom: 11 },
  { name: 'Pichavaram Lagoon (TN)', center: [11.43, 79.78] as LatLng, zoom: 13 },
  { name: 'Bhitarkanika Ramsar (OD)', center: [20.72, 86.87] as LatLng, zoom: 11 },
  { name: 'Coringa Estuary (AP)', center: [16.85, 82.25] as LatLng, zoom: 12 },
  { name: 'Baratang Island (AN)', center: [12.12, 92.76] as LatLng, zoom: 12 },
];

export const Pillar1_Registration: React.FC<Pillar1RegistrationProps> = ({
  onBoundaryVerified,
}) => {
  // Input Mode: 'DRAW' (Interactive click-to-draw polygon) vs 'PRESET' (Preset Indian Mangrove sites & Fraud tests)
  const [inputMode, setInputMode] = useState<'DRAW' | 'PRESET'>('DRAW');
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(true);
  const [showCcnLayers, setShowCcnLayers] = useState<boolean>(true);

  // Map viewport center & zoom
  const [mapCenter, setMapCenter] = useState<LatLng>([21.88, 88.75]);
  const [mapZoom, setMapZoom] = useState<number>(11);

  // Form State
  const [projectName, setProjectName] = useState('Sundarbans Delta Custom Mangrove Conservation Zone');
  const [ngoName, setNgoName] = useState('Sundarbans Coastal Climate Action Alliance');
  const [ngoWallet, setNgoWallet] = useState('0x71C...9E34');
  const [ngoRegNo, setNgoRegNo] = useState('WB-ENV-NGO-2024-8199');
  const [areaHectares, setAreaHectares] = useState<number>(145.2);

  // Selected Coordinates and Presets
  const [currentCoords, setCurrentCoords] = useState<LatLng[]>([
    [21.88, 88.73],
    [21.88, 88.78],
    [21.93, 88.78],
    [21.93, 88.73]
  ]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [boundaryResult, setBoundaryResult] = useState<BoundaryCheckResult | null>(null);
  const [engineSource, setEngineSource] = useState<'FASTAPI' | 'CLIENT_FALLBACK' | null>(null);

  // Live Area and Perimeter Calculations
  const liveArea = useMemo(() => {
    if (currentCoords.length < 3) return 0;
    return calculatePolygonAreaHa(currentCoords);
  }, [currentCoords]);

  const livePerimeter = useMemo(() => {
    if (currentCoords.length < 2) return 0;
    if (currentCoords.length < 3) return calculatePolylineLengthKm(currentCoords);
    return calculatePolygonPerimeterKm(currentCoords);
  }, [currentCoords]);

  // Quick preset loader
  const handleSelectPreset = (preset: PresetLocation) => {
    setSelectedPreset(preset.id);
    const coords = preset.polygon.length > 0 ? preset.polygon : [preset.coordinates];
    setCurrentCoords(coords);
    setBoundaryResult(null);
    setEngineSource(null);
    setIsDrawingMode(false);
    
    if (coords.length > 0) {
      setMapCenter(coords[0]);
      setMapZoom(preset.type === 'mangrove' ? 11 : 12);
    }
    
    if (preset.type === 'mangrove') {
      setProjectName(`${preset.name} Blue Carbon Initiative`);
      const area = coords.length >= 3 ? calculatePolygonAreaHa(coords) : 280;
      setAreaHectares(area);
    } else if (preset.type === 'urban') {
      setProjectName(`[Fraud Test] ${preset.name} Highrise Carbon Scheme`);
      setAreaHectares(45);
    } else if (preset.type === 'desert') {
      setProjectName(`[Fraud Test] ${preset.name} Desert Offset`);
      setAreaHectares(500);
    }
  };

  // Jump camera to preset mangrove area
  const handleJumpToRegion = (bookmark: typeof MANGROVE_REGION_BOOKMARKS[0]) => {
    setMapCenter(bookmark.center);
    setMapZoom(bookmark.zoom);
  };

  // Map Click Handler: adds vertex in DRAW mode, or drops centroid box in PRESET mode
  const handleMapClick = (latlng: LatLng) => {
    if (isDrawingMode) {
      const newCoords = [...currentCoords, latlng];
      setCurrentCoords(newCoords);
      setSelectedPreset('');
      setBoundaryResult(null);
      setEngineSource(null);

      if (newCoords.length >= 3) {
        const computedArea = calculatePolygonAreaHa(newCoords);
        setAreaHectares(computedArea);
      }
    } else {
      // Centroid box
      const square: LatLng[] = [
        [latlng[0] - 0.01, latlng[1] - 0.01],
        [latlng[0] - 0.01, latlng[1] + 0.01],
        [latlng[0] + 0.01, latlng[1] + 0.01],
        [latlng[0] + 0.01, latlng[1] - 0.01],
      ];
      setCurrentCoords(square);
      setSelectedPreset('');
      setBoundaryResult(null);
      setEngineSource(null);
      setAreaHectares(calculatePolygonAreaHa(square));
    }
  };

  // Drag-and-drop / fine-tune vertex repositioning
  const handleUpdateVertex = (index: number, newCoord: LatLng) => {
    setCurrentCoords((prev) => {
      const next = [...prev];
      next[index] = newCoord;
      if (next.length >= 3) {
        setAreaHectares(calculatePolygonAreaHa(next));
      }
      return next;
    });
    setBoundaryResult(null);
  };

  // Drawing Controls
  const handleStartFreshDrawing = () => {
    setCurrentCoords([]);
    setSelectedPreset('');
    setBoundaryResult(null);
    setAreaHectares(0);
    setIsDrawingMode(true);
    setInputMode('DRAW');
  };

  const handleUndoVertex = () => {
    if (currentCoords.length === 0) return;
    const newCoords = currentCoords.slice(0, -1);
    setCurrentCoords(newCoords);
    setBoundaryResult(null);
    if (newCoords.length >= 3) {
      setAreaHectares(calculatePolygonAreaHa(newCoords));
    } else if (newCoords.length === 0) {
      setAreaHectares(0);
    }
  };

  const handleClearVertices = () => {
    setCurrentCoords([]);
    setSelectedPreset('');
    setBoundaryResult(null);
    setAreaHectares(0);
  };

  const handleRemoveVertexAtIndex = (index: number) => {
    const newCoords = currentCoords.filter((_, idx) => idx !== index);
    setCurrentCoords(newCoords);
    setBoundaryResult(null);
    if (newCoords.length >= 3) {
      setAreaHectares(calculatePolygonAreaHa(newCoords));
    } else {
      setAreaHectares(0);
    }
  };

  const handleCompletePolygon = () => {
    if (currentCoords.length < 3) return;
    setIsDrawingMode(false);
    const computedArea = calculatePolygonAreaHa(currentCoords);
    setAreaHectares(computedArea);
    runGatekeeperCheck();
  };

  // Run Spatial Gatekeeper Verification
  const runGatekeeperCheck = async () => {
    if (currentCoords.length < 3) return;
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Pillar 1 Hero Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-r from-ocean-900 via-ocean-850 to-[#022c22] border border-emerald-500/30 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Pillar 1: Anti-Fraud Spatial Registration Gatekeeper</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Interactive GIS Boundary Delineation & Anti-Fraud Verification
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Eliminate fraudulent greenwashing at the gate. Trace your restoration boundary with multi-vertex precision on high-resolution satellite imagery. Coordinates are verified in real time against the <span className="text-emerald-400 font-semibold">Global Mangrove Watch (GMW v3.0)</span> dataset and calibrated with Smithsonian Coastal Carbon Network soil core baselines.
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 hidden md:block pointer-events-none">
          <Radar className="w-64 h-64 text-emerald-400 animate-spin" style={{ animationDuration: '20s' }} />
        </div>
      </div>

      {/* Mode Switcher: Custom Interactive Drawing vs Preset Sites */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-2.5 rounded-2xl bg-ocean-900/60 border border-ocean-800 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setInputMode('DRAW');
              setIsDrawingMode(true);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2.5 transition-all duration-200 ${
              inputMode === 'DRAW'
                ? 'bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-400/80'
                : 'text-slate-300 hover:text-white hover:bg-ocean-800 border border-transparent hover:border-ocean-700'
            }`}
          >
            <PenTool className="w-4 h-4 text-cyan-300" />
            <span>✏️ Interactive Multi-Vertex Drawing Mode</span>
            {inputMode === 'DRAW' && isDrawingMode && (
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-400 text-ocean-950 font-black uppercase tracking-wider animate-pulse">
                ON
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setInputMode('PRESET');
              setIsDrawingMode(false);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all duration-200 ${
              inputMode === 'PRESET'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-300 hover:text-white hover:bg-ocean-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>⚡ Preset Sites & Anti-Fraud Cases</span>
          </button>
        </div>

        {/* Quick Actions & Stats Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleStartFreshDrawing}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Start Fresh Boundary</span>
          </button>

          <div className="flex items-center space-x-3 px-3 py-1.5 rounded-xl bg-ocean-950/80 border border-ocean-800 text-xs font-mono">
            <span className="text-slate-400">Vertices: <strong className="text-cyan-400">{currentCoords.length}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Area: <strong className="text-emerald-400">{liveArea > 0 ? liveArea.toLocaleString() : (areaHectares || 0)} ha</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Perimeter: <strong className="text-cyan-300">{livePerimeter > 0 ? `${livePerimeter} km` : '0 km'}</strong></span>
          </div>
        </div>
      </div>

      {/* Preset Test Case Selector (Visible when PRESET mode is active) */}
      {inputMode === 'PRESET' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Select Mangrove Reserve or Anti-Fraud Test Case
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
      )}

      {/* Main Form & Interactive GIS Map Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Form: Project & NGO Metadata + Drawing Controls */}
        <div className="xl:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Project Registration & GIS Data</h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Pillar 1
              </span>
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

              {/* Multi-Vertex Drawing Toolbar */}
              <div className="bg-ocean-950/80 p-3.5 rounded-xl border border-ocean-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-ocean-850">
                  <div className="flex items-center space-x-1.5 text-slate-100 font-bold">
                    <PenTool className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs uppercase tracking-wide">Boundary Tool</span>
                  </div>
                  <button
                    onClick={() => setIsDrawingMode(!isDrawingMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center space-x-2 border transition-all duration-200 shadow-md ${
                      isDrawingMode
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-ocean-950 border-emerald-300 ring-2 ring-emerald-400/80 shadow-emerald-500/30'
                        : 'bg-ocean-900 hover:bg-ocean-850 text-slate-200 border-2 border-cyan-500/50 hover:border-cyan-400'
                    }`}
                    title={isDrawingMode ? 'Drawing mode is ON. Click to pause.' : 'Click to enable Drawing Mode'}
                  >
                    <span>{isDrawingMode ? '● ACTIVE' : '○ PAUSED'}</span>
                    <div className={`w-7 h-3.5 rounded-full p-0.5 flex items-center transition-colors ${
                      isDrawingMode ? 'bg-ocean-950' : 'bg-slate-700'
                    }`}>
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                        isDrawingMode ? 'translate-x-3.5 bg-emerald-300' : 'translate-x-0 bg-white'
                      }`} />
                    </div>
                  </button>
                </div>

                {/* Helpful Instruction Alert */}
                <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200">
                  💡 <strong>Precision Placement:</strong> Click anywhere on the map to add vertices. You can <strong>drag any numbered pin</strong> with your mouse to fine-tune boundaries!
                </div>

                {/* Live Area / Perimeter Statistics */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-ocean-900/60 p-2 rounded-lg border border-ocean-800">
                    <div className="text-slate-400 text-[10px]">Points</div>
                    <div className="font-bold font-mono text-cyan-300">{currentCoords.length}</div>
                  </div>
                  <div className="bg-ocean-900/60 p-2 rounded-lg border border-ocean-800">
                    <div className="text-slate-400 text-[10px]">Geodesic Area</div>
                    <div className="font-bold font-mono text-emerald-400">
                      {liveArea > 0 ? `${liveArea.toLocaleString()} ha` : `${areaHectares} ha`}
                    </div>
                  </div>
                  <div className="bg-ocean-900/60 p-2 rounded-lg border border-ocean-800">
                    <div className="text-slate-400 text-[10px]">Perimeter</div>
                    <div className="font-bold font-mono text-cyan-300">
                      {livePerimeter > 0 ? `${livePerimeter} km` : '0 km'}
                    </div>
                  </div>
                </div>

                {/* Drawing Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUndoVertex}
                    disabled={currentCoords.length === 0}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-ocean-900 hover:bg-ocean-850 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-ocean-700 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Undo Point</span>
                  </button>
                  <button
                    onClick={handleClearVertices}
                    disabled={currentCoords.length === 0}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-ocean-900 hover:bg-red-950/60 hover:border-red-500/50 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-ocean-700 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Clear All</span>
                  </button>
                  <button
                    onClick={handleCompletePolygon}
                    disabled={currentCoords.length < 3}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 text-white" />
                    <span>Lock & Test</span>
                  </button>
                </div>

                {/* Placed Coordinates Vertex Chips */}
                {currentCoords.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>Boundary Vertices ({currentCoords.length}):</span>
                      <span className="text-cyan-400">Drag pin on map to adjust</span>
                    </div>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {currentCoords.map((coord, idx) => (
                        <div
                          key={`chip-${idx}`}
                          className="flex items-center justify-between px-2 py-1 rounded bg-ocean-900/90 border border-ocean-800 text-[10px] font-mono text-slate-300"
                        >
                          <span className="text-cyan-400 font-bold">#{idx + 1}</span>
                          <span>[{coord[0].toFixed(4)}°N, {coord[1].toFixed(4)}°E]</span>
                          <button
                            onClick={() => handleRemoveVertexAtIndex(idx)}
                            className="text-slate-500 hover:text-red-400 px-1 font-bold text-xs"
                            title="Remove this point"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Trigger Gatekeeper Button */}
              <button
                onClick={runGatekeeperCheck}
                disabled={isChecking || currentCoords.length < 3}
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

        {/* Right: Interactive GIS Map & Side-by-Side Drawing Dock */}
        <div className="xl:col-span-8 space-y-3">
          {/* Mangrove Camera Jump Bar */}
          <div className="p-2.5 rounded-xl bg-ocean-900/70 border border-ocean-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jump to Mangrove Belts:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {MANGROVE_REGION_BOOKMARKS.map((bm) => (
                <button
                  key={bm.name}
                  onClick={() => handleJumpToRegion(bm)}
                  className="px-2.5 py-1 rounded-lg bg-ocean-950 hover:bg-ocean-800 text-slate-300 hover:text-cyan-300 border border-ocean-800 text-[10px] font-semibold transition-colors"
                >
                  {bm.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-sm sm:text-base font-extrabold text-white">
                Interactive High-Res Satellite Delineation Map
              </span>
            </div>
          </div>

          {/* High-Resolution Satellite Delineation Map Canvas */}
          <div className="w-full">
            <MapComponent
              center={mapCenter}
              zoom={mapZoom}
              projectCoords={currentCoords}
              isValidBoundary={boundaryResult ? boundaryResult.isValid : null}
              onSelectCoordinates={handleMapClick}
              selectedGmwZoneId={boundaryResult?.matchedGmwZone?.id}
              heightClass="h-[560px]"
              projectName={projectName}
              showCcnLayers={showCcnLayers}
              onToggleCcnLayers={() => setShowCcnLayers((prev) => !prev)}
              isDrawingMode={isDrawingMode}
              onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
              onUpdateVertex={handleUpdateVertex}
              onCompletePolygon={handleCompletePolygon}
              liveAreaHa={liveArea}
            />
          </div>

          {/* GMW & CCN Scientific Reference Info */}
          <div className="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Mangrove habitats in <strong className="text-emerald-400">glowing emerald</strong>. Smithsonian CCN sediment cores in <strong className="text-amber-400">glowing amber</strong>. Custom vertices in <strong className="text-cyan-400">numbered cyan pins</strong> (draggable).
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-300">
              GMW v3.0 Vectors & Smithsonian CCN Ground-Truth Layer Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
