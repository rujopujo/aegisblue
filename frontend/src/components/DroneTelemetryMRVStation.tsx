import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Camera, 
  Video, 
  Pause, 
  Play, 
  Sun, 
  Clock, 
  Layers, 
  Eye, 
  Maximize2,
  Satellite
} from 'lucide-react';

interface DroneTelemetryMRVStationProps {
  onLaunchMRV?: () => void;
}

export const DroneTelemetryMRVStation: React.FC<DroneTelemetryMRVStationProps> = ({
  onLaunchMRV
}) => {
  // Console Mode & Telemetry State
  const [viewMode, setViewMode] = useState<'video' | 'photo'>('photo');
  const [activeResolution, setActiveResolution] = useState<string>('1920x1080');
  const [activeChannel, setActiveChannel] = useState<'R' | 'G' | 'B' | 'Y' | 'ALL'>('ALL');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [seconds, setSeconds] = useState<number>(129); // 02:09
  const [levelVal, setLevelVal] = useState<number>(48);
  const [isKtActive, setIsKtActive] = useState<boolean>(false);

  // Flight telemetry live simulation
  const [heightM, setHeightM] = useState<number>(83);
  const [speedKmh, setSpeedKmh] = useState<number>(22);

  // Timer & telemetry simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
      // Subtle realistic UAV sensor drift
      setHeightM(prev => Math.max(78, Math.min(88, prev + (Math.random() > 0.5 ? 1 : -1))));
      setSpeedKmh(prev => Math.max(20, Math.min(25, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Spectral filter CSS style based on selected channel
  const getFilterStyle = () => {
    switch (activeChannel) {
      case 'R':
        return 'contrast(125%) saturate(140%) sepia(20%) hue-rotate(-20deg)';
      case 'G':
        return 'contrast(120%) saturate(180%) hue-rotate(35deg)'; // NDVI vegetation focus
      case 'B':
        return 'contrast(115%) saturate(160%) hue-rotate(180deg)'; // Hydrology & water table focus
      case 'Y':
        return 'contrast(135%) saturate(190%) hue-rotate(10deg)'; // Sediment & biomass heat
      default:
        return 'none';
    }
  };

  return (
    <div className="bg-[#FAF8F5] rounded-3xl border border-[#E2DDD2] p-4 sm:p-7 shadow-sm space-y-6">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION TITLE & CONTEXT HEADER (Light Theme Editorial)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#E8E2D6]">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Autonomous Coastal Drone & Optical MRV Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#002B49] font-display">
            Live Estuary Inspection & Telemetry Station
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-light">
            Continuous sub-decimeter multispectral imaging capturing mangrove canopy biomass, tidal sediment siltation, and parcel boundaries in real time.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#E2DDD2] text-[11px] font-mono font-bold text-slate-700 flex items-center space-x-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>UAV-2804 LINK ACTIVE</span>
          </div>
          {onLaunchMRV && (
            <button
              onClick={onLaunchMRV}
              className="px-4 py-2 rounded-xl bg-[#002B49] hover:bg-[#001E33] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Open Pillar 2 Engine
            </button>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN DRONE HUD MONITOR (Matching Reference Screenshot)
          Framed in crisp, clean architectural stone bezel
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#181B1F] rounded-2xl overflow-hidden border-2 border-[#E2DDD2] shadow-md relative group select-none">
        
        {/* Main Camera Feed / Photographic View */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
          <img
            src="/images/drone-mrv-feed.jpg"
            alt="Autonomous drone aerial farm view"
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: getFilterStyle() }}
          />

          {/* Natural atmospheric & lens shading */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none"></div>

          {/* ── TOP HUD BAR ── */}
          <div className="absolute top-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono z-20">
            
            {/* Left controls: HDR indicator, Framerate, Level, Mode, Color Channels */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              
              {/* HDR Badge */}
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-md border border-white/20 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-slate-100">HDR</span>
              </div>

              {/* Resolution & FPS */}
              <div className="font-bold text-amber-300 drop-shadow-sm text-[11px] sm:text-xs">
                4K - 19.67 FPS
              </div>

              {/* Gimbal Level Indicator (Interactive) */}
              <div className="hidden md:flex items-center space-x-2 text-[10px] text-slate-200">
                <span>Level</span>
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    setLevelVal(Math.max(10, Math.min(90, Math.round((clickX / rect.width) * 100))));
                  }}
                  className="w-24 h-2.5 bg-white/20 hover:bg-white/30 rounded-full relative overflow-hidden cursor-pointer transition-colors"
                  title="Click to adjust gimbal level"
                >
                  <div 
                    className="h-full bg-orange-400 rounded-full transition-all duration-300 pointer-events-none"
                    style={{ width: `${levelVal}%` }}
                  ></div>
                </div>
              </div>

              {/* KT Mode Button */}
              <button
                onClick={() => setIsKtActive(!isKtActive)}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-bold transition-all cursor-pointer ${
                  isKtActive 
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200' 
                    : 'bg-black/30 border-white/30 text-white hover:bg-white/10'
                }`}
              >
                KT
              </button>

              {/* Multispectral / Color Channel Toggles (R, G, B, Y) */}
              <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md p-0.5 rounded-lg border border-white/15">
                <button
                  onClick={() => setActiveChannel(activeChannel === 'R' ? 'ALL' : 'R')}
                  className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[10px] font-bold cursor-pointer transition-all ${
                    activeChannel === 'R' ? 'bg-red-500/40 text-red-200 border border-red-400' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Red Spectrum Channel (B4 665nm)"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>R</span>
                </button>

                <button
                  onClick={() => setActiveChannel(activeChannel === 'G' ? 'ALL' : 'G')}
                  className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[10px] font-bold cursor-pointer transition-all ${
                    activeChannel === 'G' ? 'bg-emerald-500/40 text-emerald-200 border border-emerald-400' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Green / Vegetation NDVI Channel"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>G</span>
                </button>

                <button
                  onClick={() => setActiveChannel(activeChannel === 'B' ? 'ALL' : 'B')}
                  className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[10px] font-bold cursor-pointer transition-all ${
                    activeChannel === 'B' ? 'bg-blue-500/40 text-blue-200 border border-blue-400' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Blue / Hydrological Silt Channel"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>B</span>
                </button>

                <button
                  onClick={() => setActiveChannel(activeChannel === 'Y' ? 'ALL' : 'Y')}
                  className={`px-2 py-0.5 rounded flex items-center space-x-1 text-[10px] font-bold cursor-pointer transition-all ${
                    activeChannel === 'Y' ? 'bg-amber-500/40 text-amber-200 border border-amber-400' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="Yellow / Thermal Sediment Soil Carbon Channel"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Y</span>
                </button>
              </div>

            </div>

            {/* Right controls: Play/Pause & Session Timer */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1.5 rounded-md bg-black/40 hover:bg-black/60 border border-white/20 text-white cursor-pointer transition-colors"
                title={isPlaying ? 'Pause Feed' : 'Resume Feed'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="px-2.5 py-1 rounded-md bg-black/40 border border-white/20 font-mono text-[11px] font-bold tracking-wider">
                {formatTimer(seconds)}
              </div>
            </div>

          </div>

          {/* ── CENTER TARGET RETICLE (Exact Precision Crosshair) ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-28 h-28 flex items-center justify-center opacity-85">
              {/* Crosshair horizontal line */}
              <div className="absolute left-0 right-0 h-[1px] bg-white/80"></div>
              {/* Crosshair vertical line */}
              <div className="absolute top-0 bottom-0 w-[1px] bg-white/80"></div>
              {/* Central circular reticle */}
              <div className="w-7 h-7 rounded-full border border-white/90 bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              {/* Outer tick marks */}
              <div className="absolute -top-3 text-[9px] font-mono text-white/80 font-bold">0.0°</div>
            </div>
          </div>

          {/* ── BOTTOM LEFT: RADIOMETRIC HISTOGRAM (H2.85) ── */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="bg-black/50 backdrop-blur-md p-2 rounded-lg border border-white/20 space-y-1 w-36 sm:w-44">
              <div className="text-[10px] font-mono font-bold text-white tracking-wider flex items-center justify-between">
                <span>H2.85</span>
                <span className="text-[8px] text-slate-300 font-normal">SPECTRAL DENSITY</span>
              </div>
              {/* Bar graph matching reference */}
              <div className="h-9 flex items-end justify-between gap-[2px] pt-1">
                {[12, 18, 25, 30, 22, 15, 35, 42, 60, 75, 95, 80, 65, 48, 32, 28, 20, 15, 10].map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t-xs transition-all duration-300 ${
                      i >= 8 && i <= 12 ? 'bg-orange-500' : 'bg-white/70'
                    }`}
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* ── BOTTOM RIGHT: COMPASS HUD (325° NW) ── */}
          <div className="absolute bottom-4 right-4 z-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/50 backdrop-blur-md border border-white/30 flex items-center justify-center relative shadow-lg">
              {/* Compass tick marks */}
              <div className="absolute inset-1 rounded-full border border-dashed border-white/30"></div>
              {/* Center heading readout */}
              <div className="text-center font-mono select-none">
                <div className="text-xs sm:text-sm font-black text-orange-400">325°</div>
                <div className="text-[9px] font-bold text-slate-200">NW</div>
              </div>
              {/* Compass Needle */}
              <div className="absolute top-1.5 w-1 h-2 bg-red-500 rounded-full"></div>
            </div>
          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────────
            LOWER TELEMETRY DECK (Exact Layout in Crisp Light Theme)
            ───────────────────────────────────────────────────────────── */}
        <div className="bg-[#FFFFFF] p-4 sm:p-6 border-t border-[#E2DDD2] text-slate-800">
          
          {/* Header Row with "Real time view" and [Video] [Photo] tabs */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-[#002B49] tracking-tight font-display">
                Real time view
              </h3>
              <span className="hidden sm:inline-block text-xs text-slate-500 font-mono">
                • GPS Lock: RTK-FIXED (±1.4cm)
              </span>
            </div>

            {/* Tabs: Video & Photo (Matching terracotta reference tab) */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setViewMode('video')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'video'
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
              
              <button
                onClick={() => setViewMode('photo')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'photo'
                    ? 'bg-[#C2633C] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo</span>
              </button>
            </div>
          </div>

          {/* 3-Column Instrument Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Column 1: Orthomosaic Flight Map Thumbnail (3 cols) */}
            <div className="lg:col-span-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner group">
                <img
                  src="/images/drone-orthomosaic-map.jpg"
                  alt="Agricultural field orthomosaic map tile"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                
                {/* SVG Flight Path Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  <path
                    d="M 15,85 Q 35,45 50,50 T 80,25"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  {/* Waypoint circle */}
                  <circle cx="50" cy="50" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
                </svg>

                {/* Pulsing Drone Position Beacon */}
                <div className="absolute top-[46%] left-[46%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 animate-ping absolute"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-md relative"></div>
                </div>

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono font-bold text-white px-2 py-1 rounded bg-black/60 backdrop-blur-xs">
                  <span>PARCEL #TN-04</span>
                  <span className="text-emerald-400">WAYPOINT 3/8</span>
                </div>
              </div>
            </div>

            {/* Column 2: 2x3 Telemetry Cluster (6 cols) */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-2 gap-3.5 font-mono">
              
              {/* Speed */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD2] flex items-center space-x-3 shadow-2xs hover:border-emerald-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <Satellite className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Speed</div>
                  <div className="text-lg font-black text-[#002B49]">{speedKmh} <span className="text-xs font-normal text-slate-600">km/h</span></div>
                </div>
              </div>

              {/* Lens */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD2] flex items-center space-x-3 shadow-2xs hover:border-emerald-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4 text-slate-700" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Lens</div>
                  <div className="text-lg font-black text-[#002B49]">25 <span className="text-xs font-normal text-slate-600">mm</span></div>
                </div>
              </div>

              {/* Height */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD2] flex items-center space-x-3 shadow-2xs hover:border-emerald-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <Maximize2 className="w-4 h-4 text-sky-700" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Height</div>
                  <div className="text-lg font-black text-[#002B49]">{heightM} <span className="text-xs font-normal text-slate-600">m</span></div>
                </div>
              </div>

              {/* ISO */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD2] flex items-center space-x-3 shadow-2xs hover:border-emerald-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">ISO</div>
                  <div className="text-lg font-black text-[#002B49]">600</div>
                </div>
              </div>

              {/* Flight Time */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD2] flex items-center space-x-3 shadow-2xs hover:border-emerald-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-indigo-700" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Flight time</div>
                  <div className="text-lg font-black text-[#002B49]">5h 34m</div>
                </div>
              </div>

              {/* Shutter */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E2DDD2] flex items-center space-x-3 shadow-2xs hover:border-emerald-500 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-700 flex items-center justify-center shrink-0">
                  <Sun className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Shutter</div>
                  <div className="text-lg font-black text-[#002B49]">180.0</div>
                </div>
              </div>

            </div>

            {/* Column 3: Display Resolution Selector (3 cols) */}
            <div className="lg:col-span-3 space-y-2.5 font-mono">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Display resolution
              </div>

              {[
                { res: '1280x720', statusActive: false, dotColor: 'bg-orange-400' },
                { res: '1920x1080', statusActive: true, dotColor: 'bg-emerald-500' },
                { res: '854x480', statusActive: false, dotColor: 'bg-orange-400' },
                { res: '640x360', statusActive: false, dotColor: 'bg-orange-400' },
              ].map((item) => (
                <button
                  key={item.res}
                  onClick={() => setActiveResolution(item.res)}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                    activeResolution === item.res
                      ? 'bg-slate-100 border-[#002B49] text-[#002B49] font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      activeResolution === item.res ? 'border-[#002B49] bg-[#002B49]' : 'border-slate-300'
                    }`}>
                      {activeResolution === item.res && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <span>{item.res}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                    <span className="text-[9px]">Status</span>
                    <span className="text-[9px]">D</span>
                    <span className={`w-2 h-2 rounded-full ${item.res === activeResolution ? 'bg-emerald-500' : 'bg-orange-400'}`}></span>
                  </div>
                </button>
              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
