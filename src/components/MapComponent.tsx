import { useEffect, useMemo, FC } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LatLng } from '../types';
import { GMW_MANGROVE_ZONES } from '../data/gmwBoundaries';

// Custom Map Marker Icons using SVGs
const createCustomIcon = (color: string, label: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
    <path fill="${color}" stroke="#000" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="3.5" fill="#ffffff"/>
  </svg>`;

  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
      ${svg}
      <span style="background: rgba(7, 15, 38, 0.9); color: #fff; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; border: 1px solid ${color}; white-space: nowrap; margin-top: -4px;">${label}</span>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });
};

// Map click listener hook
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
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
}) => {
  const markerIcon = useMemo(() => {
    if (isValidBoundary === true) {
      return createCustomIcon('#10b981', 'GMW Verified');
    } else if (isValidBoundary === false) {
      return createCustomIcon('#ef4444', 'FRAUD REJECTED');
    }
    return createCustomIcon('#06b6d4', 'Project Pin');
  }, [isValidBoundary]);

  const targetPoint = projectCoords.length > 0 ? projectCoords[0] : center;

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-ocean-800 shadow-2xl bg-ocean-950`}>
      {/* Map Header Status Tag */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap gap-2 pointer-events-none">
        <div className="px-3 py-1 rounded-lg bg-ocean-950/90 backdrop-blur-md border border-ocean-700 text-[11px] font-mono text-slate-300 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sentinel-2 Esri World Imagery (High-Res 10m)</span>
        </div>
        {isValidBoundary !== null && (
          <div className={`px-3 py-1 rounded-lg backdrop-blur-md border text-[11px] font-bold flex items-center space-x-1.5 ${
            isValidBoundary 
              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
              : 'bg-red-950/90 text-red-300 border-red-500/50'
          }`}>
            <span>{isValidBoundary ? '✓ GMW v3.0 Approved Mangrove Biome' : '⚠ FRAUD ALERT: Non-Mangrove Zone'}</span>
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <ChangeView center={center} zoom={zoom} />
        
        {onSelectCoordinates && (
          <MapClickHandler onMapClick={onSelectCoordinates} />
        )}

        {/* High-res Satellite Imagery Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a>, Earthstar Geographics'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          maxZoom={18}
        />

        {/* Global Mangrove Watch Boundary Polygons */}
        {showGMWLayers && GMW_MANGROVE_ZONES.map((zone) => {
          const isSelected = zone.id === selectedGmwZoneId;
          return (
            <Polygon
              key={zone.id}
              positions={zone.coordinates}
              pathOptions={{
                color: isSelected ? '#34d399' : '#10b981',
                fillColor: isSelected ? '#10b981' : '#059669',
                fillOpacity: isSelected ? 0.45 : 0.25,
                weight: isSelected ? 3 : 1.8,
                dashArray: isSelected ? undefined : '4, 4'
              }}
            >
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
            </Polygon>
          );
        })}

        {/* Pinned Target Marker */}
        {projectCoords.length > 0 && (
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

        {/* Pinned Project Polygon Boundary if multiple points exist */}
        {projectCoords.length >= 3 && (
          <Polygon
            positions={projectCoords}
            pathOptions={{
              color: isValidBoundary === false ? '#ef4444' : '#06b6d4',
              fillColor: isValidBoundary === false ? '#ef4444' : '#22d3ee',
              fillOpacity: 0.35,
              weight: 2.5,
            }}
          />
        )}
      </MapContainer>

      {/* Interactive Map Overlay Instructions */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] bg-ocean-950/85 backdrop-blur-md p-2.5 rounded-xl border border-ocean-800 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
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
        <div className="text-[11px] text-slate-400 italic">
          💡 Click anywhere on the map or pick a preset to pin GPS coordinates
        </div>
      </div>
    </div>
  );
};
