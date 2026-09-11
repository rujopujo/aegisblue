# ≡ƒîè AegisBlue ΓÇó Pillar 4: Marketplace, ESG Dashboard & PDF Certificate Engine

> **SIH 2026 Hackathon ΓÇó Blue Carbon MRV & Tokenization Platform**  
> **Lead Developer (Member 4):** Sarthak Bongane  
> **Branch:** `feature/pillar-4-marketplace-esg`

---

## ≡ƒôî Architecture & Overview

AegisBlue is an end-to-end Blue Carbon MRV and Tokenization platform. **Pillar 4** provides the commercialization, corporate retirement, and cryptographic compliance layer that links:
- **Member 2's Satellite MRV Telemetry**: ESA Sentinel-2 NDVI canopy density indices and Smithsonian CCN soil organic carbon depth data.
- **Member 3's Web3 Tokenization**: Polygon Amoy smart contract addresses, token IDs, and IPFS audit dossier CIDs.
- **Corporate Buyers**: Scope 1 & 2 industrial compliance offsets, instant on-chain token burns, and verified ESG Certificates of Recognition.

---

## Γ£¿ Features Implemented

### 1. Credit Marketplace Storefront (`src/components/Pillar4_Marketplace.tsx`)
- Card-based interface displaying verified Indian coastal projects (Sundarbans Mangrove, Bhitarkanika Tidal Wetland, Pichavaram Coastal Lagoon).
- Ecosystem filter pills (Mangrove, Tidal Wetland, Seagrass Meadow) and dynamic multi-criteria sorting (Price, Remaining Stock, MRV Audit Score).
- Integrated MRV Dossier drawer displaying Sentinel-2 multispectral metrics, Smithsonian CCN soil cores, and Polygon smart contract bindings.

### 2. On-Chain Retire Modal & Token Burn (`src/components/ESGCertificateModal.tsx`)
- Interactive offset calculator with dynamic tree conservation equivalencies and flight hour offsets.
- Simulated on-chain token burn with realistic Polygon Amoy testnet latency (Chain ID 80002) and automatic dead address routing (`0x000...dEaD`) to eliminate double-spending risks.
- Instant high-fidelity visual preview of the minted ESG Certificate of Recognition.

### 3. Verified ESG PDF Generator (`src/services/certificateGenerator.ts`)
- Automated client-side PDF compilation using `jsPDF` & `qrcode`.
- Classic ornamental award layout with dual antique gold guilloche filigree frames, arched banner ribbon, calligraphic recipient typography (`Great Vibes`), circular embossed security seal, registry serial box, and scannable verification QR code linking to PolygonScan.

### 4. Enterprise ESG Reporting Dashboard (`src/components/EnterpriseDashboard.tsx`)
- Executive analytics overview tracking total tCO2e retired, capital deployed, and equivalent habitat sinks.
- Quarterly retirement trajectory charts and habitat distribution breakdowns.
- Auditable corporate retirement ledger with direct PolygonScan transaction links and one-click PDF certificate re-downloads.

---

## ≡ƒ¢á∩╕Å Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Vanilla CSS Glassmorphism
- **PDF & Cryptographic Proofs**: `jspdf`, `qrcode`, `canvas-confetti`
- **Icons**: `lucide-react`
- **Fonts**: `Plus Jakarta Sans`, `Rajdhani`, `Cinzel`, `Great Vibes`, `JetBrains Mono`

---

## ≡ƒÜÇ Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/rujopujo/aegisblue.git
cd aegisblue
git checkout feature/pillar-4-marketplace-esg
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:5173`) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## ≡ƒôü Project Structure

```text
Γö£ΓöÇΓöÇ src/
Γöé   Γö£ΓöÇΓöÇ components/
Γöé   Γöé   Γö£ΓöÇΓöÇ Navbar.tsx                   # Top navigation with Web3 network pill
Γöé   Γöé   Γö£ΓöÇΓöÇ Pillar4_Marketplace.tsx      # Blue carbon marketplace storefront & MRV drawer
Γöé   Γöé   Γö£ΓöÇΓöÇ ESGCertificateModal.tsx      # Retire calculator & golden award preview
Γöé   Γöé   ΓööΓöÇΓöÇ EnterpriseDashboard.tsx      # Corporate ESG analytics & on-chain ledger
Γöé   Γö£ΓöÇΓöÇ data/
Γöé   Γöé   ΓööΓöÇΓöÇ mockProjects.ts              # Verified coastal project telemetry
Γöé   Γö£ΓöÇΓöÇ services/
Γöé   Γöé   ΓööΓöÇΓöÇ certificateGenerator.ts      # jsPDF engine with dynamic QR code
Γöé   Γö£ΓöÇΓöÇ types/
Γöé   Γöé   ΓööΓöÇΓöÇ marketplace.ts               # Strict TypeScript schemas
Γöé   Γö£ΓöÇΓöÇ App.tsx                          # Root application container & tab router
Γöé   Γö£ΓöÇΓöÇ index.css                        # Glassmorphism, animations, and design tokens
Γöé   ΓööΓöÇΓöÇ main.tsx                         # DOM entry point
Γö£ΓöÇΓöÇ index.html                           # Entry HTML & Google Webfonts
Γö£ΓöÇΓöÇ package.json                         # Project dependencies & scripts
Γö£ΓöÇΓöÇ tailwind.config.js                   # Tailwind utility configurations
Γö£ΓöÇΓöÇ tsconfig.json                        # TypeScript compiler options
ΓööΓöÇΓöÇ vite.config.ts                       # Vite build configuration
```
