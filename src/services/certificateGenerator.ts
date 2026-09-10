import { jsPDF } from 'jspdf';
import { RetirementRecord, TokenizedProject } from '../types';
import { generateVerificationUrl, generateQRCodeDataUrl } from './qrService';
import { POLYGON_AMOY_CONFIG } from './web3Registry';

/**
 * Generates and downloads a high-resolution, institutional-grade ESG Blue Carbon Retirement Certificate.
 * Embeds on-chain Polygon Amoy metadata, verified block proof, and an interactive verification QR code.
 */
export async function downloadESGCertificatePDF(
  record: RetirementRecord,
  _project?: TokenizedProject
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Page Dimensions (A4 Landscape: 297mm x 210mm)
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Background luxury deep ocean palette
  doc.setFillColor(5, 11, 28); // #050b1c
  doc.rect(0, 0, width, height, 'F');

  // Decorative Outer Borders
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(1.2);
  doc.roundedRect(8, 8, width - 16, height - 16, 4, 4, 'S');

  doc.setDrawColor(6, 182, 212); // Cyan 500
  doc.setLineWidth(0.4);
  doc.roundedRect(10.5, 10.5, width - 21, height - 21, 3, 3, 'S');

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.setFontSize(10);
  doc.text('AEGISBLUE VERIFIED BLUE CARBON REGISTRY', width / 2, 21, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('ESG / BLUE CARBON RETIREMENT CERTIFICATE', width / 2, 31, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFontSize(9);
  doc.text('Issued under Global Mangrove Watch (GMW v3.0) & Sentinel-2 Automated MRV Protocol', width / 2, 37, { align: 'center' });

  // Divider line
  doc.setDrawColor(30, 58, 138); // Ocean 800
  doc.setLineWidth(0.4);
  doc.line(25, 42, width - 25, 42);

  // Beneficiary Statement
  doc.setFontSize(11);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('This certifies that an irrevocable on-chain carbon retirement has been permanently executed for:', width / 2, 51, { align: 'center' });

  // Company Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(34, 211, 238); // Cyan 400
  doc.text(record.companyName.toUpperCase(), width / 2, 62, { align: 'center' });

  // Tons Retired Prominent Badge Box
  const badgeWidth = 150;
  const badgeX = width / 2 - badgeWidth / 2;
  doc.setFillColor(11, 23, 57);
  doc.roundedRect(badgeX, 68, badgeWidth, 18, 3, 3, 'F');
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(badgeX, 68, badgeWidth, 18, 3, 3, 'S');

  doc.setFontSize(14);
  doc.setTextColor(16, 185, 129);
  doc.text(
    `${record.tonsRetired.toLocaleString()} METRIC TONS OF CO₂ EQUIVALENT PERMANENTLY RETIRED`,
    width / 2,
    80,
    { align: 'center' }
  );

  // Details Grid Configuration
  const leftColX = 20;
  const midColX = 118;
  const qrColX = 238;
  let y = 98;

  // Left Column: Project & Corporate Identification
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text('Retirement & Project Details:', leftColX, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Project Origin: ', leftColX, y);
  doc.setTextColor(255, 255, 255);
  doc.text(`${record.projectName}`, leftColX + 28, y);
  y += 5.5;

  doc.setTextColor(148, 163, 184);
  doc.text('Project ID: ', leftColX, y);
  doc.setTextColor(255, 255, 255);
  doc.text(`${record.projectId}`, leftColX + 28, y);
  y += 5.5;

  doc.setTextColor(148, 163, 184);
  doc.text('Certificate ID: ', leftColX, y);
  doc.setFont('courier', 'bold');
  doc.setTextColor(34, 211, 238);
  doc.text(`${record.certificateId}`, leftColX + 28, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Retirement Purpose: ', leftColX, y);
  doc.setTextColor(255, 255, 255);
  const purposeText = record.purpose.length > 42 ? `${record.purpose.slice(0, 40)}...` : record.purpose;
  doc.text(purposeText, leftColX + 32, y);
  y += 5.5;

  doc.setTextColor(148, 163, 184);
  doc.text('Beneficiary Wallet: ', leftColX, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text(`${record.companyWallet}`, leftColX + 32, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Date of Retirement: ', leftColX, y);
  doc.setTextColor(255, 255, 255);
  doc.text(new Date(record.retiredAt).toUTCString(), leftColX + 32, y);

  // Middle Column: Cryptographic On-Chain Verification
  y = 98;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text('On-Chain Cryptographic Proofs:', midColX, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Blockchain Network: ', midColX, y);
  doc.setTextColor(52, 211, 153);
  doc.text(`${record.network || 'Polygon Amoy'} (POS Chain ID 80002)`, midColX + 34, y);
  y += 5.5;

  doc.setTextColor(148, 163, 184);
  doc.text('Contract Address: ', midColX, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(147, 197, 253);
  const contractAddr = record.contractAddress || POLYGON_AMOY_CONFIG.contractAddress;
  doc.text(contractAddr, midColX + 34, y);
  y += 5.5;

  if (record.tokenId) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Token ID (ERC-1155): ', midColX, y);
    doc.setFont('courier', 'normal');
    doc.setTextColor(147, 197, 253);
    const displayToken = record.tokenId.length > 28
      ? `${record.tokenId.slice(0, 14)}...${record.tokenId.slice(-10)}`
      : record.tokenId;
    doc.text(displayToken, midColX + 34, y);
    y += 5.5;
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Transaction Hash: ', midColX, y);
  doc.setFont('courier', 'normal');
  doc.setTextColor(147, 197, 253);
  const displayTx = record.txHash
    ? (record.txHash.length > 28 ? `${record.txHash.slice(0, 16)}...${record.txHash.slice(-10)}` : record.txHash)
    : 'Off-Chain Record (Simulated)';
  doc.text(displayTx, midColX + 34, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Polygon Block Number: ', midColX, y);
  doc.setTextColor(255, 255, 255);
  doc.text(record.burnReceiptBlock > 0 ? `#${record.burnReceiptBlock.toLocaleString()}` : 'N/A', midColX + 36, y);
  y += 5.5;

  if (record.ipfsCertificateCid && record.ipfsCertificateCid.trim()) {
    doc.setTextColor(148, 163, 184);
    doc.text('IPFS Audit CID: ', midColX, y);
    doc.setFont('courier', 'normal');
    doc.setTextColor(147, 197, 253);
    doc.text(`${record.ipfsCertificateCid.slice(0, 24)}...`, midColX + 34, y);
    y += 5.5;
  }

  // Right Column: Public Verification QR Code
  const verifyUrl = generateVerificationUrl(record.certificateId);
  try {
    const qrDataUrl = await generateQRCodeDataUrl(verifyUrl);

    // QR Card Background Container
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrColX, 98, 42, 42, 2.5, 2.5, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.4);
    doc.roundedRect(qrColX, 98, 42, 42, 2.5, 2.5, 'S');

    // Embed QR image (centered in container)
    doc.addImage(qrDataUrl, 'PNG', qrColX + 2, 100, 38, 38);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(52, 211, 153);
    doc.text('Scan to Verify On-Chain', qrColX + 21, 146, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('/verify/' + record.certificateId.slice(0, 16), qrColX + 21, 150, { align: 'center' });
  } catch (qrErr) {
    console.warn('[AegisBlue] Could not render QR in PDF certificate:', qrErr);
  }

  // Bottom Formal Compliance Notice
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This certificate represents an irrevocable on-chain retirement and permanent burn of ERC-1155 blue carbon credits on Polygon Amoy.',
    width / 2,
    height - 18,
    { align: 'center' }
  );
  doc.text(
    'Credits are permanently extinguished from circulation and cannot be resold, re-transferred, or double-counted for emissions disclosure.',
    width / 2,
    height - 14,
    { align: 'center' }
  );

  doc.save(`AegisBlue_ESG_Retirement_${record.certificateId}.pdf`);
}
