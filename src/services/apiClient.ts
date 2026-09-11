import {
  LatLng,
  BoundaryCheckResult,
  SatelliteBandData,
  CarbonAuditMetrics,
  TokenizedProject,
  RetirementRecord,
  CertificateVerificationResult,
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

export interface RetireCreditsPayload {
  project: TokenizedProject;
  tonsToRetire: number;
  companyName: string;
  companyWallet: string;
  purpose: string;
  tokenId?: string;
  transactionHash?: string;
  blockNumber?: number;
  retiredAt?: string;
  certificateId?: string;
  ipfsCertificateCid?: string;
}

export interface RetireCreditsResponse {
  success: boolean;
  updatedProject: TokenizedProject;
  retirementRecord: RetirementRecord;
  source: 'FASTAPI' | 'CLIENT_FALLBACK' | 'CLIENT_PENDING_SYNC';
  error?: string;
}

/**
 * Synchronizes confirmed retirement data to Python FastAPI backend without re-executing on blockchain
 */
export async function apiSyncRetirement(
  params: RetireCreditsPayload
): Promise<{
  success: boolean;
  updatedProject?: TokenizedProject;
  retirementRecord?: RetirementRecord;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/retirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: params.project.id,
        tonsToRetire: params.tonsToRetire,
        companyName: params.companyName,
        companyWallet: params.companyWallet,
        purpose: params.purpose,
        tokenId: params.tokenId || params.project.tokenization.tokenId,
        transactionHash: params.transactionHash,
        blockNumber: params.blockNumber,
        retiredAt: params.retiredAt,
        certificateId: params.certificateId,
        ipfsCertificateCid: params.ipfsCertificateCid,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        updatedProject: data.updatedProject,
        retirementRecord: data.retirementRecord,
      };
    }
    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errData.detail || `Backend sync failed with HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error contacting backend database.',
    };
  }
}

/**
 * Records confirmed credit retirement with FastAPI or client fallback
 * Preserves confirmed on-chain transaction hash and avoids re-executing retirement on sync errors.
 */
export async function apiRetireCredits(
  projectOrParams: TokenizedProject | RetireCreditsPayload,
  tonsToRetireParam?: number,
  companyNameParam?: string,
  companyWalletParam?: string,
  purposeParam?: string,
  extra?: {
    tokenId?: string;
    transactionHash?: string;
    blockNumber?: number;
    retiredAt?: string;
    certificateId?: string;
    ipfsCertificateCid?: string;
  }
): Promise<RetireCreditsResponse> {
  const isPayloadObj = 'project' in projectOrParams;
  const project = isPayloadObj ? projectOrParams.project : projectOrParams;
  const tonsToRetire = isPayloadObj ? projectOrParams.tonsToRetire : (tonsToRetireParam || 0);
  const companyName = isPayloadObj ? projectOrParams.companyName : (companyNameParam || 'Enterprise');
  const companyWallet = isPayloadObj ? projectOrParams.companyWallet : (companyWalletParam || '');
  const purpose = isPayloadObj ? projectOrParams.purpose : (purposeParam || 'ESG Compliance');
  const tokenId = isPayloadObj ? projectOrParams.tokenId : extra?.tokenId;
  const transactionHash = isPayloadObj ? projectOrParams.transactionHash : extra?.transactionHash;
  const blockNumber = isPayloadObj ? projectOrParams.blockNumber : extra?.blockNumber;
  const retiredAt = isPayloadObj ? projectOrParams.retiredAt : extra?.retiredAt;
  const certificateId = isPayloadObj ? projectOrParams.certificateId : extra?.certificateId;
  const ipfsCertificateCid = isPayloadObj ? projectOrParams.ipfsCertificateCid : extra?.ipfsCertificateCid;

  try {
    const res = await fetch(`${API_BASE}/api/retirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        tonsToRetire,
        companyName,
        companyWallet,
        purpose,
        tokenId: tokenId || project.tokenization.tokenId,
        transactionHash,
        blockNumber,
        retiredAt,
        certificateId,
        ipfsCertificateCid,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        updatedProject: data.updatedProject,
        retirementRecord: data.retirementRecord,
        source: 'FASTAPI',
      };
    }
  } catch (err) {
    console.warn('[AegisBlue] FastAPI retirement endpoint offline or failed to sync:', err);
  }

  // If a real on-chain transaction hash exists, preserve it! Do NOT fabricate or re-burn.
  if (transactionHash) {
    const nowIso = retiredAt || new Date().toISOString();
    const certId = certificateId || `ESG-NETZERO-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;
    const fallbackRecord: RetirementRecord = {
      id: `RET-${Date.now().toString().slice(-6)}`,
      projectId: project.id,
      projectName: project.name,
      companyName,
      companyWallet,
      tonsRetired: tonsToRetire,
      purpose,
      vintageYear: 2026,
      txHash: transactionHash,
      burnReceiptBlock: blockNumber || 0,
      retiredAt: nowIso,
      certificateId: certId,
      ipfsCertificateCid: ipfsCertificateCid || '',
      tokenId: tokenId || project.tokenization.tokenId,
    };

    const updatedProject: TokenizedProject = {
      ...project,
      tokenization: {
        ...project.tokenization,
        availableCredits: Math.max(0, project.tokenization.availableCredits - tonsToRetire),
        retiredCredits: project.tokenization.retiredCredits + tonsToRetire,
      },
    };

    return {
      success: false,
      updatedProject,
      retirementRecord: fallbackRecord,
      source: 'CLIENT_PENDING_SYNC',
      error: 'Blockchain retirement succeeded on Polygon Amoy, but backend database synchronization failed.',
    };
  }

  // Fallback to client-side simulated execution (for offline demo mode without real wallet)
  const fallback = executeTokenRetirement(project, tonsToRetire, companyName, companyWallet, purpose);
  return {
    success: true,
    updatedProject: fallback.updatedProject,
    retirementRecord: fallback.retirementRecord,
    source: 'CLIENT_FALLBACK',
  };
}


export interface PinAuditDossierParams {
  projectId: string;
  auditHash: string;
  totalCredits: number;
  projectName?: string;
  ngoName?: string;
  locationName?: string;
  areaHectares?: number;
  coordinates?: LatLng[];
  spectralData?: SatelliteBandData;
  carbonMetrics?: CarbonAuditMetrics;
  nearestCcnCore?: CcnCoreSampleInfo;
  dossier?: Record<string, any>;
  customMetadata?: Record<string, any>;
}

export interface PinAuditDossierResult {
  status: string;
  cid: string;
  gatewayUrl: string;
  pinSize: number;
  timestamp: string;
  projectId: string;
  auditHash: string;
  totalCredits: number;
  dossier: Record<string, any>;
}

/**
 * Pins audit dossier to IPFS via Python FastAPI backend (which contacts Pinata securely server-side)
 */
export async function apiPinAuditDossier(
  params: PinAuditDossierParams
): Promise<PinAuditDossierResult> {
  const res = await fetch(`${API_BASE}/api/ipfs/pin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    let errorMessage = `IPFS pinning failed with HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData?.detail) {
        errorMessage = errData.detail;
      }
    } catch (_jsonErr) {
      // Use fallback error message
    }
    throw new Error(errorMessage);
  }

  return await res.json();
}

/**
 * Queries the authoritative backend registry for certificate details by certificateId.
 * Strictly read-only; never mutates blockchain state.
 */
export async function apiVerifyCertificate(
  certificateId: string
): Promise<{
  success: boolean;
  data?: CertificateVerificationResult;
  status: number;
  error?: string;
}> {
  const cleanId = (certificateId || '').trim();
  if (!cleanId) {
    return {
      success: false,
      status: 400,
      error: 'Certificate ID cannot be empty.',
    };
  }

  try {
    const res = await fetch(`${API_BASE}/api/verify/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        data,
        status: res.status,
      };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      status: res.status,
      error: errData.detail || `Certificate verification failed with HTTP ${res.status}.`,
    };
  } catch (err: any) {
    return {
      success: false,
      status: 503,
      error: err?.message || 'Unable to reach the AegisBlue verification registry service.',
    };
  }
}

