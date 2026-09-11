import QRCode from 'qrcode';

/**
 * Derives the canonical public verification URL for a given ESG retirement certificate.
 * Uses configurable environment base URL if available, falling back to current browser origin.
 */
export function generateVerificationUrl(certificateId: string): string {
  const cleanId = (certificateId || '').trim();
  const metaEnv = (import.meta as any).env;
  const envBaseUrl = metaEnv?.VITE_PUBLIC_APP_URL || metaEnv?.VITE_APP_URL;

  let origin = 'https://aegisblue.io';
  if (envBaseUrl && typeof envBaseUrl === 'string' && envBaseUrl.startsWith('http')) {
    origin = envBaseUrl.replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location && window.location.origin) {
    origin = window.location.origin;
  }

  return `${origin}/verify/${encodeURIComponent(cleanId)}`;
}

/**
 * Generates a high-contrast, crisp base64 PNG data URL representing the verification QR code.
 * Optimized for embedding into jsPDF documents and rendering on web screens.
 */
export async function generateQRCodeDataUrl(
  text: string,
  options?: QRCode.QRCodeToDataURLOptions
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    width: 280,
    margin: 2,
    color: {
      dark: '#031b26', // Deep corporate ocean
      light: '#ffffff', // Clean white background for contrast & scan reliability
    },
    errorCorrectionLevel: 'M',
  };

  return await QRCode.toDataURL(text, { ...defaultOptions, ...options });
}

/**
 * Generates an SVG string representation of the QR code for vector rendering.
 */
export async function generateQRCodeSvg(
  text: string,
  options?: QRCode.QRCodeToStringOptions
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToStringOptions = {
    type: 'svg',
    margin: 2,
    color: {
      dark: '#031b26',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  };

  return await QRCode.toString(text, { ...defaultOptions, ...options });
}
