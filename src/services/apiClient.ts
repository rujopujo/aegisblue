import {
  LatLng,
  BoundaryCheckResult,
  SatelliteBandData,
  CarbonAuditMetrics,
  TokenizedProject,
  RetirementRecord,
  CcnCoreSampleInfo
} from '../types';
import { validateBoundaryAgainstGMW } from './spatialValidator';
import { fetchSentinel2Data, computeCarbonAudit, generateNDVIGrid } from './satelliteAuditor';
import { executeTokenRetirement } from './web3Registry';

// In local development and Docker, FastAPI is reached at http://localhost:8000 (with fallback to proxy)
const API_BASE = 'http://localhost:8000';

export interface BackendStatus {
  isOnline: boolean;
  serviceName?: string;
  version?: string;
  timestamp?: string;
  capabilities?: string[];
}

let cachedStatus: BackendStatus = { isOnline: false };
const listeners: ((status: BackendStatus) => void)[] = [];

export function subscribeToBackendStatus(cb: (status: BackendStatus) => void): () => void {
  listeners.push(cb);
  cb(cachedStatus);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function notifyListeners(status: BackendStatus) {
  cachedStatus = status;
  listeners.forEach((cb) => cb(status));
}

/**
 * Pings Python FastAPI backend health check with 2.5s timeout
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const candidates = ['http://localhost:8000/health', '/health'];

  for (const url of candidates) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data && data.status === 'HEALTHY') {
            const status: BackendStatus = {
              isOnline: true,
              serviceName: data.service || 'AegisBlue Python MRV',
              version: data.version || '1.0.0',
              timestamp: data.timestamp,
              capabilities: data.capabilities || []
            };
            notifyListeners(status);
            return status;
          }
        } catch (_jsonErr) {
          // Not valid JSON (e.g. dev server HTML)
        }
      }
    } catch (_err) {
      // Continue to next candidate
    }
  }

  const offlineStatus: BackendStatus = { isOnline: false };
  notifyListeners(offlineStatus);
  return offlineStatus;
}

/**
 * Validates project boundary using Python Shapely backend, with client-side fallback
 */
export async function apiValidateBoundary(
  coordinates: LatLng[]
): Promise<{ result: BoundaryCheckResult; source: 'FASTAPI' | 'CLIENT_FALLBACK' }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE}/api/spatial/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data: BoundaryCheckResult = await res.json();
      return { result: data, source: 'FASTAPI' };
    }
  } catch (err) {
    console.warn('[AegisBlue] FastAPI spatial check unreachable, engaging client-side fallback engine:', err);
  }

  // Graceful fallback to client-side spatialValidator
  const fallback = validateBoundaryAgainstGMW(coordinates);
  return { result: fallback, source: 'CLIENT_FALLBACK' };
}

/**
 * Runs Sentinel-2 multispectral MRV audit via Python backend with client-side fallback
 */
export async function apiAuditSatellite(
  coordinates: LatLng,
  areaHa: number,
  canopyDensityMultiplier: number = 0.82
): Promise<{
  spectralData: SatelliteBandData;
  carbonMetrics: CarbonAuditMetrics;
  heatmapGrid: { x: number; y: number; ndvi: number; color: string }[];
  nearestCcnCore?: CcnCoreSampleInfo;
  source: 'FASTAPI' | 'CLIENT_FALLBACK';
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(`${API_BASE}/api/satellite/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates: [coordinates[0], coordinates[1]],
        areaHa,
        canopyDensityMultiplier
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        spectralData: data.spectralData,
        carbonMetrics: data.carbonMetrics,
        heatmapGrid: data.heatmapGrid,
        nearestCcnCore: data.nearestCcnCore,
        source: 'FASTAPI'
      };
    }
  } catch (err) {
    console.warn('[AegisBlue] FastAPI satellite audit unreachable, engaging client-side fallback engine:', err);
  }

  // Fallback to client-side satelliteAuditor
  const spectral = fetchSentinel2Data(coordinates, areaHa);
  const metrics = computeCarbonAudit(spectral, areaHa, canopyDensityMultiplier);
  const heatmap = generateNDVIGrid(metrics.ndvi);

  return {
    spectralData: spectral,
    carbonMetrics: metrics,
    heatmapGrid: heatmap,
    source: 'CLIENT_FALLBACK'
  };
}

/**
 * Fetches tokenized projects from SQLite backend, with fallback
 */
export async function apiFetchProjects(
  fallbackProjects: TokenizedProject[]
): Promise<{ projects: TokenizedProject[]; source: 'FASTAPI' | 'CLIENT_FALLBACK' }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE}/api/projects`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const list: TokenizedProject[] = await res.json();
      if (list && list.length > 0) {
        return { projects: list, source: 'FASTAPI' };
      }
    }
  } catch (_err) {
    // Backend offline
  }

  return { projects: fallbackProjects, source: 'CLIENT_FALLBACK' };
}

/**
 * Saves a newly tokenized project to SQLite backend
 */
export async function apiSaveProject(project: TokenizedProject): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    return res.ok;
  } catch (err) {
    console.warn('[AegisBlue] Could not sync project to SQLite backend:', err);
    return false;
  }
}

/**
 * Executes credit retirement with FastAPI or client fallback
 */
export async function apiRetireCredits(
  project: TokenizedProject,
  tonsToRetire: number,
  companyName: string,
  companyWallet: string,
  purpose: string
): Promise<{
  updatedProject: TokenizedProject;
  retirementRecord: RetirementRecord;
  source: 'FASTAPI' | 'CLIENT_FALLBACK';
}> {
  try {
    const res = await fetch(`${API_BASE}/api/retirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        tonsToRetire,
        companyName,
        companyWallet,
        purpose
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        updatedProject: data.updatedProject,
        retirementRecord: data.retirementRecord,
        source: 'FASTAPI'
      };
    }
  } catch (err) {
    console.warn('[AegisBlue] FastAPI retirement endpoint offline, falling back to local Web3 engine:', err);
  }

  // Fallback to client-side web3Registry execution
  const fallback = executeTokenRetirement(project, tonsToRetire, companyName, companyWallet, purpose);
  return {
    updatedProject: fallback.updatedProject,
    retirementRecord: fallback.retirementRecord,
    source: 'CLIENT_FALLBACK'
  };
}
