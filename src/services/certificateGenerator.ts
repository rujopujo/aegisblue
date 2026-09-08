import { jsPDF } from 'jspdf';
import { RetirementRecord, TokenizedProject } from '../types';

export function downloadESGCertificatePDF(
  record: RetirementRecord,
  _project?: TokenizedProject
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Dimensions
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background gradient-like dark luxury theme
  doc.setFillColor(7, 15, 38); // #070f26 (Deep Ocean)
  doc.rect(0, 0, width, height, 'F');

  // Decorative Border
  doc.setDrawColor(16, 185, 129); // Mangrove Emerald
  doc.setLineWidth(1.5);
  doc.roundedRect(8, 8, width - 16, height - 16, 4, 4, 'S');

  doc.setDrawColor(6, 182, 212); // Cyan Glow
  doc.setLineWidth(0.5);
  doc.roundedRect(11, 11, width - 22, height - 22, 3, 3, 'S');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // #34d399
  doc.setFontSize(11);
  doc.text('AEGISBLUE VERIFIED BLUE CARBON REGISTRY', width / 2, 24, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('OFFICIAL CERTIFICATE OF CARBON RETIREMENT', width / 2, 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFontSize(10);
  doc.text('Issued under the Global Mangrove Watch & Sentinel-2 Automated MRV Protocol', width / 2, 42, { align: 'center' });

  // Divider line
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.4);
  doc.line(30, 47, width - 30, 47);

  // Body text - Beneficiary
  doc.setFontSize(12);
  doc.setTextColor(203, 213, 225);
  doc.text('This is to certify that an irrevocable on-chain retirement has been executed on behalf of:', width / 2, 57, { align: 'center' });

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(34, 211, 238); // Cyan 400
  doc.text(record.companyName.toUpperCase(), width / 2, 70, { align: 'center' });

  // Tons Retired Box
  doc.setFillColor(11, 23, 57);
  doc.roundedRect(width / 2 - 80, 78, 160, 22, 3, 3, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(width / 2 - 80, 78, 160, 22, 3, 3, 'S');

  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129);
  doc.text(
    `${record.tonsRetired.toLocaleString()} METRIC TONS OF CO₂ EQUIVALENT PERMANENTLY RETIRED`,
    width / 2,
    92,
    { align: 'center' }
  );

  // Project and Audit Details Grid
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);

  const leftCol = 25;
  const rightCol = width / 2 + 15;
  let y = 112;

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(226, 232, 240);
  doc.text('Retirement & Project Details:', leftCol, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Project Origin: `, leftCol, y);
  doc.setTextColor(255, 255, 255);
  doc.text(`${record.projectName}`, leftCol + 32, y);
  y += 6;

  doc.setTextColor(148, 163, 184);
  doc.text(`Certificate ID: `, leftCol, y);
  doc.setTextColor(255, 255, 255);
  doc.text(`${record.certificateId}`, leftCol + 32, y);
  y += 6;

  doc.setTextColor(148, 163, 184);
  doc.text(`Retirement Purpose: `, leftCol, y);
  doc.setTextColor(255, 255, 255);
  doc.text(`${record.purpose}`, leftCol + 32, y);
  y += 6;

  doc.setTextColor(148, 163, 184);
  doc.text(`Beneficiary Wallet: `, leftCol, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text(`${record.companyWallet}`, leftCol + 32, y);

  // Right column (Blockchain & MRV Proofs)
  y = 112;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(226, 232, 240);
  doc.text('Cryptographic Verification & Satellite Audit:', rightCol, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Network: `, rightCol, y);
  doc.setTextColor(255, 255, 255);
  doc.text(`Polygon Amoy (EVM POS Proof of Stake)`, rightCol + 30, y);
  y += 6;

  doc.setTextColor(148, 163, 184);
  doc.text(`Tx Hash: `, rightCol, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text(`${record.txHash.slice(0, 32)}...`, rightCol + 30, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`IPFS Metadata CID: `, rightCol, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text(`${record.ipfsCertificateCid}`, rightCol + 30, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`MRV Standard: `, rightCol, y);
  doc.setTextColor(52, 211, 153);
  doc.text(`Sentinel-2 Spectral Canopy NDVI & GMW v3.0 Spatial Gatekeeper`, rightCol + 30, y);

  // Bottom Notice
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This credit retirement has been permanently burned on the Polygon Amoy blockchain. It cannot be re-transferred, resold, or counted again for emissions reduction compliance.',
    width / 2,
    height - 18,
    { align: 'center' }
  );

  doc.save(`AegisBlue_ESG_Retirement_${record.certificateId}.pdf`);
}
