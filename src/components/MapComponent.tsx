import { useEffect, useMemo, FC } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LatLng } from '../types';
import { GMW_MANGROVE_ZONES } from '../data/gmwBoundaries';
import { Crosshair } from 'lucide-react';

// Custom Map Marker Icons using SVGs
const createCustomIcon = (color: string, label: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
    <path fill="${color}" stroke="#000" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; pointer-events: auto;">
      ${svg}
      <span style="background: rgba(7, 15, 38, 0.95); color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; border: 1px solid ${color}; white-space: nowrap; margin-top: -4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">${label}</span>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
};

// Custom Vertex Pin Dot for Drawing Mode (Numbered, glowing, draggable)
const createVertexIcon = (index: number, isFirst: boolean, canClose: boolean) => {
  const bg = isFirst && canClose ? '#10b981' : isFirst ? '#06b6d4' : '#0284c7';
  const border = isFirst && canClose ? '#6ee7b7' : '#38bdf8';
  const pulseClass = isFirst && canClose ? 'animate-pulse ring-4 ring-emerald-400/80 shadow-emerald-500/50' : '';
  
  return L.divIcon({
    className: 'vertex-pin',
    html: `<div class="${pulseClass}" style="transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: ${bg}; border: 2.5px solid ${border}; box-shadow: 0 0 12px rgba(6,182,212,0.8); font-size: 11px; font-weight: 900; color: #ffffff; font-family: monospace; cursor: grab;">
      ${index + 1}
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Map click listener hook - stops event propagation when needed
function MapClickHandler({ onMapClick, enabled }: { onMapClick: (latlng: LatLng) => void; enabled: boolean }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onMapClick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

// Map center updater
function ChangeView({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

// Recenter button placed below zoom controls
function RecenterButton({ target, zoom }: { target: LatLng; zoom: number }) {
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-left pointer-events-auto" style={{ marginTop: '76px', marginLeft: '10px' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          map.setView(target, zoom, { animate: true });
        }}
        className="w-[30px] h-[30px] rounded-md bg-ocean-950 hover:bg-ocean-900 border border-ocean-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 flex items-center justify-center shadow-lg transition-all"
        title="Recenter map on your boundary site"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
}

interface MapComponentProps {
  center: LatLng;
  zoom?: number;
  projectCoords: LatLng[];
  isValidBoundary?: boolean | null;
  onSelectCoordinates?: (coords: LatLng) => void;
  showGMWLayers?: boolean;
  selectedGmwZoneId?: string;
  heightClass?: string;
  projectName?: string;
  // Multi-Vertex Polygon Drawing Mode Props
  isDrawingMode?: boolean;
  onToggleDrawingMode?: () => void;
  onUpdateVertex?: (index: number, newCoord: LatLng) => void;
  onCompletePolygon?: () => void;
  liveAreaHa?: number;
}

export const MapComponent: FC<MapComponentProps> = ({
  center,
  zoom = 6,
  projectCoords,
  isValidBoundary = null,
  onSelectCoordinates,
  showGMWLayers = true,
  selectedGmwZoneId,
  heightClass = 'h-[440px]',
  projectName = 'Project Site',
  isDrawingMode = false,
  onToggleDrawingMode,
  onUpdateVertex,
  onCompletePolygon,
  liveAreaHa,
}) => {
  const markerIcon = useMemo(() => {
    if (isValidBoundary === true) {
      return createCustomIcon('#10b981', 'GMW Verified');
    } else if (isValidBoundary === false) {
      return createCustomIcon('#ef4444', 'FRAUD REJECTED');
    }
    return createCustomIcon('#06b6d4', 'Project Centroid');
  }, [isValidBoundary]);

  const targetPoint = projectCoords.length > 0 ? projectCoords[0] : center;
  const canClosePolygon = isDrawingMode && projectCoords.length >= 3;

  const recenterTarget: LatLng = useMemo(() => {
    if (projectCoords.length > 0) {
      const lats = projectCoords.map((c) => c[0]);
      const lngs = projectCoords.map((c) => c[1]);
      return [
        (Math.min(...lats) + Math.max(...lats)) / 2,
        (Math.min(...lngs) + Math.max(...lngs)) / 2,
      ];
    }
    return center;
  }, [projectCoords, center]);

  return (
    <div className={`relative z-0 isolate w-full ${heightClass} rounded-2xl overflow-hidden border border-ocean-800 shadow-2xl bg-ocean-950 ${isDrawingMode ? 'drawing-mode-active' : ''}`}>
      {/* Floating Drawing Switch Overlay in Top-Right Corner of Map Canvas */}
      {onToggleDrawingMode && (
        <div className="absolute top-3 right-3 z-[1000] pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleDrawingMode();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center space-x-2.5 transition-all duration-200 shadow-2xl backdrop-blur-md border ${
              isDrawingMode
                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-ocean-950 border-emerald-300 ring-2 ring-emerald-400/90 shadow-emerald-500/50 scale-105'
                : 'bg-ocean-950/95 hover:bg-ocean-900 text-slate-100 border-2 border-cyan-500/70 hover:border-cyan-400 hover:scale-105 shadow-xl'
            }`}
            title={isDrawingMode ? 'Drawing mode is active. Click to pause.' : 'Click to enable interactive polygon drawing mode'}
          >
            <div className="flex items-center space-x-1.5">
              <span className="text-sm">{isDrawingMode ? '✏️' : '✋'}</span>
              <span className="tracking-wider uppercase text-[11px]">
                {isDrawingMode ? 'DRAWING: ON' : 'DRAWING: OFF'}
              </span>
            </div>

            {/* Sliding Pill Toggle Graphic */}
            <div className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors ${
              isDrawingMode ? 'bg-ocean-950' : 'bg-slate-700'
            }`}>
              <div className={`w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${
                isDrawingMode ? 'translate-x-4 bg-emerald-300' : 'translate-x-0 bg-white'
              }`} />
            </div>
          </button>
        </div>
      )}

      {/* Map Header Status Tag */}
      <div className="absolute top-3 left-12 sm:left-14 z-[1000] flex flex-wrap gap-2 pointer-events-none max-w-[calc(100%-180px)]">
        <div className="px-2.5 py-1 rounded-lg bg-ocean-950/90 backdrop-blur-md border border-ocean-700 text-[11px] font-mono text-slate-300 flex items-center space-x-1.5 shadow-lg truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="truncate">Sentinel-2 (10m)</span>
        </div>
        {isValidBoundary !== null && (
          <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md border text-[11px] font-bold flex items-center space-x-1.5 shadow-lg truncate ${
            isValidBoundary 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
              : 'bg-red-950/90 text-red-300 border-red-500/50'
          }`}>
            <span className="truncate">{isValidBoundary ? '✓ GMW v3.0 Approved' : '⚠ Non-Mangrove Zone'}</span>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        doubleClickZoom={false}
        scrollWheelZoom={true}
        className={`w-full h-full ${isDrawingMode ? 'drawing-mode-active' : ''}`}
      >
        <ChangeView center={center} zoom={zoom} />
        <RecenterButton target={recenterTarget} zoom={zoom} />
        
        {onSelectCoordinates && (
          <MapClickHandler onMapClick={onSelectCoordinates} enabled={true} />
        )}

        {/* High-res Satellite Imagery Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />

        {/* Global Mangrove Watch Boundary Polygons */}
        {/* CRITICAL: Set interactive={!isDrawingMode} so GMW polygons DO NOT swallow map clicks when drawing! */}
        {showGMWLayers && GMW_MANGROVE_ZONES.map((zone) => {
          const isSelected = zone.id === selectedGmwZoneId;
          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              interactive={!isDrawingMode}
              pathOptions={{
                color: isSelected ? '#34d399' : '#10b981',
                fillColor: isSelected ? '#10b981' : '#059669',
                fillOpacity: isSelected ? 0.40 : 0.20,
                weight: isSelected ? 3 : 1.8,
                dashArray: isSelected ? undefined : '4, 4'
              }}
            >
              {!isDrawingMode && (
                <Popup>
                  <div className="p-1 max-w-xs text-xs space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center space-x-1">
                      <span>🛡️ {zone.name}</span>
                    </div>
                    <div className="text-slate-300 text-[11px]">{zone.description}</div>
                    <div className="text-slate-400 font-mono text-[10px]">
                      Area: <span className="text-white font-bold">{zone.areaHectares.toLocaleString()} ha</span> | 
                      Avg Soil Carbon: <span className="text-emerald-400 font-bold">{zone.averageSoilCarbon} t C/ha</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-ocean-700">
                      Dominant Species: <span className="text-cyan-300">{zone.mangroveSpecies.join(', ')}</span>
                    </div>
                  </div>
                </Popup>
              )}
            </Polygon>
          );
        })}

        {/* Interactive Vertex Markers when Drawing Mode is Active (DRAGGABLE!) */}
        {isDrawingMode && projectCoords.map((coord, idx) => {
          const isFirst = idx === 0;
          return (
            <Marker
              key={`vertex-${idx}`}
              position={coord}
              draggable={true}
              icon={createVertexIcon(idx, isFirst, canClosePolygon)}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  if (isFirst && canClosePolygon && onCompletePolygon) {
                    onCompletePolygon();
                  }
                },
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  if (onUpdateVertex) {
                    onUpdateVertex(idx, [pos.lat, pos.lng]);
                  }
                }
              }}
            >
              <Popup>
                <div className="p-1 text-xs">
                  <div className="font-bold text-cyan-400 font-mono">Vertex #{idx + 1}</div>
                  <div className="text-slate-300 font-mono text-[10px]">
                    [{coord[0].toFixed(5)}, {coord[1].toFixed(5)}]
                  </div>
                  <div className="text-[10px] text-amber-300 mt-1 font-semibold">
                    ✋ Drag this pin anywhere to adjust
                  </div>
                  {isFirst && canClosePolygon && (
                    <div className="mt-1 text-[10px] text-emerald-400 font-bold">
                      👉 Click to close & finalize polygon
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Polyline connecting vertices while drawing (interactive={false} so clicks pass through) */}
        {isDrawingMode && projectCoords.length >= 2 && (
          <Polyline
            positions={projectCoords}
            interactive={false}
            pathOptions={{
              color: '#38bdf8',
              weight: 3,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Render filled polygon preview while drawing (interactive={false} so user can click inside/near it to add more points) */}
        {isDrawingMode && projectCoords.length >= 3 && (
          <Polygon
            positions={projectCoords}
            interactive={false}
            pathOptions={{
              color: '#22d3ee',
              fillColor: '#06b6d4',
              fillOpacity: 0.30,
              weight: 2,
            }}
          />
        )}

        {/* Pinned Single Target Marker when NOT in multi-vertex drawing mode and 1 point exists */}
        {!isDrawingMode && projectCoords.length === 1 && (
          <Marker position={targetPoint} icon={markerIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <div className="font-bold text-slate-100">{projectName}</div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Lat: {targetPoint[0].toFixed(5)}, Lng: {targetPoint[1].toFixed(5)}
                </div>
                <div className="mt-1 font-semibold text-[11px]">
                  Status: {isValidBoundary ? '✅ Approved by Gatekeeper' : isValidBoundary === false ? '❌ Rejected (Fraud Risk)' : '🔍 Ready for Scan'}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Pinned Project Polygon Boundary when NOT in drawing mode and >= 3 points exist */}
        {!isDrawingMode && projectCoords.length >= 3 && (
          <Polygon
            positions={projectCoords}
            pathOptions={{
              color: isValidBoundary === false ? '#ef4444' : '#06b6d4',
              fillColor: isValidBoundary === false ? '#ef4444' : '#22d3ee',
              fillOpacity: 0.35,
              weight: 2.5,
            }}
          >
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <div className="font-bold text-slate-100">{projectName}</div>
                <div className="text-slate-300 font-mono text-[11px]">
                  Vertices: {projectCoords.length} | Area: {liveAreaHa || 'N/A'} ha
                </div>
                <div className="font-semibold text-[11px]">
                  Status: {isValidBoundary ? '✅ Approved by Gatekeeper' : isValidBoundary === false ? '❌ Rejected (Fraud Risk)' : '🔍 Ready for Scan'}
                </div>
              </div>
            </Popup>
          </Polygon>
        )}
      </MapContainer>

      {/* Interactive Map Overlay Instructions & Controls (pointer-events-none so it doesn't block map clicks!) */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] pointer-events-none bg-ocean-950/85 backdrop-blur-md p-2.5 rounded-xl border border-ocean-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm border border-emerald-400 bg-emerald-500/30"></span>
            <span className="text-[11px] text-slate-300">GMW Mangrove Polygon</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm border border-cyan-400 bg-cyan-500/30"></span>
            <span className="text-[11px] text-slate-300">Project Boundary</span>
          </div>
        </div>
        <div className="text-[11px] text-cyan-300 font-medium">
          {isDrawingMode 
            ? '💡 Click map to drop points • Drag any numbered pin to reposition with precision'
            : '💡 Switch to "Custom Polygon Drawing" above to draw custom shapes'}
        </div>
      </div>
    </div>
  );
};
