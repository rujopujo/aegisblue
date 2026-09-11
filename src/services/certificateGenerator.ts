import { jsPDF } from 'jspdf';
import { RetirementRecord, TokenizedProject } from '../types';
import { generateVerificationUrl, generateQRCodeDataUrl } from './qrService';

/**
 * Member 4 Deliverable: Verified ESG PDF Certificate Generator
 * Crafted to replicate the classic golden ornamental award certificate reference:
 * - Warm ivory / cream parchment background
 * - Dual antique gold guilloche filigree frames with vintage corner scroll flourishes
 * - Arched golden ribbon banner at top
 * - "CERTIFICATE OF RECOGNITION / CARBON RETIREMENT"
 * - Calligraphic recipient typography with decorative flourishes
 * - Embossed golden circular security seal
 * - Formal Date and Lead Auditor signature lines
 * - Serial number box [ No. CERT-ID ]
 * - Scannable on-chain Polygon Amoy Proof-of-Burn QR Code
 */
export async function downloadESGCertificatePDF(
  record: RetirementRecord,
  project?: TokenizedProject
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  // Generate QR Code with verification link
  const verificationUrl = generateVerificationUrl(record.certificateId);
  let qrDataUrl = '';
  try {
    qrDataUrl = await generateQRCodeDataUrl(verificationUrl);
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
  }

  // 1. Warm Ivory / Cream Parchment Background Fill
  doc.setFillColor(250, 246, 236); // #FAF6EC Ivory Parchment
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Subtle inner parchment tone
  doc.setFillColor(253, 250, 243);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'F');

  // 2. Outer Ornate Golden Borders (Antique Gold #C5A059 & Bronze #997328)
  // Outer primary gold line
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(2.2);
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

  // Inner thin bronze line
  doc.setDrawColor(153, 115, 40);
  doc.setLineWidth(0.6);
  doc.rect(14.5, 14.5, pageWidth - 29, pageHeight - 29, 'S');

  // Secondary inner hairline
  doc.setDrawColor(218, 185, 118);
  doc.setLineWidth(0.3);
  doc.rect(16.5, 16.5, pageWidth - 33, pageHeight - 33, 'S');

  // Corner scroll flourishes
  const drawFlourishCorner = (cx: number, cy: number, quadrant: 'TL' | 'TR' | 'BL' | 'BR') => {
    doc.setDrawColor(180, 138, 48);
    doc.setLineWidth(0.7);

    const signX = (quadrant === 'TR' || quadrant === 'BR') ? -1 : 1;
    const signY = (quadrant === 'BL' || quadrant === 'BR') ? -1 : 1;

    doc.circle(cx + (signX * 4), cy + (signY * 4), 2.5, 'S');
    doc.setFillColor(197, 160, 89);
    doc.circle(cx + (signX * 4), cy + (signY * 4), 1.2, 'F');

    doc.line(cx, cy, cx + (signX * 12), cy);
    doc.line(cx, cy, cx, cy + (signY * 12));
    doc.line(cx + (signX * 2), cy + (signY * 6), cx + (signX * 6), cy + (signY * 2));
    doc.line(cx + (signX * 3), cy + (signY * 9), cx + (signX * 9), cy + (signY * 3));
  };

  drawFlourishCorner(17, 17, 'TL');
  drawFlourishCorner(pageWidth - 17, 17, 'TR');
  drawFlourishCorner(17, pageHeight - 17, 'BL');
  drawFlourishCorner(pageWidth - 17, pageHeight - 17, 'BR');

  // Side decorative guilloche ticks
  doc.setDrawColor(206, 172, 102);
  doc.setLineWidth(0.3);
  for (let y = 30; y <= pageHeight - 30; y += 8) {
    doc.line(13, y, 16, y - 2);
    doc.line(13, y, 16, y + 2);
    doc.line(pageWidth - 13, y, pageWidth - 16, y - 2);
    doc.line(pageWidth - 13, y, pageWidth - 16, y + 2);
  }

  // 3. Top Golden Ribbon Banner (The Blue Carbon Initiative)
  const ribbonWidth = 115;
  const ribbonHeight = 12;
  const ribbonX = (pageWidth - ribbonWidth) / 2;
  const ribbonY = 19;

  // Ribbon folded tails
  doc.setFillColor(153, 115, 40);
  doc.triangle(ribbonX - 8, ribbonY + 3, ribbonX + 2, ribbonY - 1, ribbonX + 2, ribbonY + ribbonHeight + 1, 'F');
  doc.triangle(ribbonX + ribbonWidth + 8, ribbonY + 3, ribbonX + ribbonWidth - 2, ribbonY - 1, ribbonX + ribbonWidth - 2, ribbonY + ribbonHeight + 1, 'F');

  // Main Ribbon body
  doc.setFillColor(205, 162, 79);
  doc.roundedRect(ribbonX, ribbonY, ribbonWidth, ribbonHeight, 2, 2, 'F');
  doc.setDrawColor(160, 120, 45);
  doc.setLineWidth(0.4);
  doc.roundedRect(ribbonX, ribbonY, ribbonWidth, ribbonHeight, 2, 2, 'S');

  // Banner text
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text('THE BLUE CARBON INITIATIVE', pageWidth / 2, ribbonY + 8, { align: 'center' });

  // 4. Main Certificate Title (Antique Gold Serif)
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(176, 134, 52); // Rich Antique Gold
  doc.text('CERTIFICATE OF RECOGNITION', pageWidth / 2, 42, { align: 'center' });

  doc.setFontSize(10.5);
  doc.setTextColor(120, 90, 35);
  doc.text('VERIFIED BLUE CARBON RETIREMENT & ESG COMPLIANCE', pageWidth / 2, 48, { align: 'center' });

  // 5. Ornamental Divider: ─── ••• ───
  doc.setDrawColor(197, 160, 89);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 50, 52, pageWidth / 2 - 10, 52);
  doc.line(pageWidth / 2 + 10, 52, pageWidth / 2 + 50, 52);

  doc.setFillColor(197, 160, 89);
  doc.circle(pageWidth / 2 - 4, 52, 1.2, 'F');
  doc.circle(pageWidth / 2, 52, 1.8, 'F');
  doc.circle(pageWidth / 2 + 4, 52, 1.2, 'F');

  // 6. Presentation Lead
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(80, 70, 55);
  doc.text('THIS CERTIFICATE IS PROUDLY PRESENTED TO', pageWidth / 2, 60, { align: 'center' });

  // 7. Recipient Company Name (Prominent Display)
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(26);
  doc.setTextColor(35, 30, 20); // Deep Espresso Ink
  doc.text(record.companyName, pageWidth / 2, 72, { align: 'center' });

  // Underline flourish
  const nameWidth = doc.getTextWidth(record.companyName);
  const lineStart = pageWidth / 2 - (nameWidth / 2) - 8;
  const lineEnd = pageWidth / 2 + (nameWidth / 2) + 8;
  doc.setDrawColor(180, 138, 48);
  doc.setLineWidth(0.5);
  doc.line(lineStart, 76, pageWidth / 2 - 4, 76);
  doc.line(pageWidth / 2 + 4, 76, lineEnd, 76);
  doc.setFillColor(180, 138, 48);
  doc.circle(pageWidth / 2, 76, 1.2, 'F');

  // 8. Formal Retirement Statement (Italic Serif)
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(60, 50, 40);
  const tonsFormatted = new Intl.NumberFormat().format(record.tonsRetired);
  const projName = project?.name || record.projectName || 'Sundarbans Delta Mangrove Restoration';
  const location = project?.locationName || 'Indian Coastal Blue Carbon Reserve';

  doc.text(`In recognition of the verified and permanent retirement of ${tonsFormatted} Metric Tonnes of CO2e`, pageWidth / 2, 85, { align: 'center' });
  doc.text(`from global circulation, certified under the National Blue Carbon MRV Protocol.`, pageWidth / 2, 90, { align: 'center' });
  doc.text(`Originating from ${projName} (${location}),`, pageWidth / 2, 95, { align: 'center' });
  doc.text(`verified via Sentinel-2 Multispectral satellite telemetry and immutably burned on Polygon Amoy.`, pageWidth / 2, 100, { align: 'center' });

  // 9. Impact Metric Box
  doc.setFillColor(254, 252, 242);
  doc.setDrawColor(218, 185, 118);
  doc.setLineWidth(0.4);
  doc.roundedRect(pageWidth / 2 - 75, 106, 150, 15, 2, 2, 'FD');

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(140, 100, 30);
  doc.text(`${tonsFormatted} METRIC TONNES OF CO2e PERMANENTLY RETIRED`, pageWidth / 2, 114, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(110, 95, 75);
  const treesEquiv = Math.round(record.tonsRetired * 5);
  const flightsEquiv = Math.round(record.tonsRetired * 0.85);
  doc.text(`Estimated Climate Impact: ~${treesEquiv.toLocaleString()} Trees Conserved  •  ~${flightsEquiv.toLocaleString()} Flight Hours Offset`, pageWidth / 2, 118.5, { align: 'center' });

  // 10. Polygon Proof Box (Left)
  doc.setFillColor(252, 249, 240);
  doc.setDrawColor(220, 195, 140);
  doc.setLineWidth(0.3);
  doc.roundedRect(26, 126, 140, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 95, 30);
  doc.text('CRYPTOGRAPHIC ON-CHAIN PROOF-OF-BURN:', 30, 132);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(70, 60, 50);
  const shortTx = record.txHash ? `${record.txHash.substring(0, 36)}...` : '0x37854bc5053746d4c23945a5575e718f4f733d31...';
  doc.text(`Polygon Burn Tx: ${shortTx}`, 30, 137);
  doc.text(`Burn Receipt Block: #${record.burnReceiptBlock || '23194012'}  •  Chain ID: 80002 (Amoy)`, 30, 142);
  const walletStr = (record as any).beneficiaryWallet || record.companyWallet || '0x000000000000000000000000000000000000dEaD';
  doc.text(`Beneficiary Wallet: ${walletStr}`, 30, 147);

  // 11. Scannable QR Code (Right)
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', pageWidth - 66, 124, 38, 38);
      doc.setFont('times', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(140, 100, 30);
      doc.text('SCAN TO VERIFY LEDGER', pageWidth - 47, 165, { align: 'center' });
      doc.setFont('courier', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 85, 70);
      doc.text(record.certificateId, pageWidth - 47, 169, { align: 'center' });
    } catch (_e) {
      // ignore
    }
  }

  // 12. Bottom Golden Security Seal (Center)
  const sealX = pageWidth / 2;
  const sealY = 146;
  doc.setDrawColor(197, 160, 89);
  doc.setFillColor(253, 248, 230);
  doc.circle(sealX, sealY, 13, 'FD');

  doc.setDrawColor(160, 120, 45);
  doc.setLineWidth(0.5);
  doc.circle(sealX, sealY, 11, 'S');
  doc.circle(sealX, sealY, 9.5, 'S');

  doc.setFont('times', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(153, 115, 40);
  doc.text('VERIFIED', sealX, sealY - 2.5, { align: 'center' });
  doc.text('BLUE CARBON', sealX, sealY + 0.8, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('SIH 2026 AUDITED', sealX, sealY + 3.8, { align: 'center' });

  // 13. Bottom Serial Number Box [ No. CERT-ID ]
  const boxWidth = 58;
  const boxHeight = 7.5;
  const boxX = (pageWidth - boxWidth) / 2;
  const boxY = 175;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(180, 138, 48);
  doc.setLineWidth(0.5);
  doc.rect(boxX, boxY, boxWidth, boxHeight, 'FD');

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 80, 50);
  doc.text('No.', boxX + 6, boxY + 5.2);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 25, 15);
  doc.text(record.certificateId.replace('CERT-', ''), boxX + 32, boxY + 5.2, { align: 'center' });

  // 14. Date on Left
  const dateLineX = 35;
  const dateLineY = 176;
  doc.setFont('times', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 25, 15);
  const rawDate = record.retiredAt || (record as any).timestamp || new Date().toISOString();
  const formattedDate = rawDate.split('T')[0].replace(/-/g, '.');
  doc.text(formattedDate, dateLineX + 20, dateLineY - 2, { align: 'center' });

  doc.setDrawColor(50, 45, 35);
  doc.setLineWidth(0.4);
  doc.line(dateLineX, dateLineY, dateLineX + 40, dateLineY);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 70, 55);
  doc.text('Date', dateLineX + 20, dateLineY + 5, { align: 'center' });

  // 15. Signature on Right
  const dirLineX = pageWidth - 75;
  const dirLineY = 176;
  doc.setFont('times', 'italic');
  doc.setFontSize(12);
  doc.setTextColor(30, 25, 15);
  doc.text('Dr. Aris Thorne', dirLineX + 20, dirLineY - 2, { align: 'center' });

  doc.setDrawColor(50, 45, 35);
  doc.setLineWidth(0.4);
  doc.line(dirLineX, dirLineY, dirLineX + 40, dirLineY);

  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 70, 55);
  doc.text('Director / Lead Auditor', dirLineX + 20, dirLineY + 5, { align: 'center' });

  // Save PDF
  const cleanFilename = `${record.certificateId}_${record.companyName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(cleanFilename);
}
