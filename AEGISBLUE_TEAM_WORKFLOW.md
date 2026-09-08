# 🌿 Team Carbon: Simple Project Workflow Guide
**SIH 2026 Hackathon** &bull; *Blue Carbon MRV & Tokenization Platform*

---

## 💡 The Big Picture in 4 Simple Steps

Here is how the entire app works from start to finish:

```
[ Step 1: Map ]       ──> User draws a boundary on a map over a mangrove forest.
         │
         ▼
[ Step 2: Satellite ] ──> Satellite scans the area, checks greenness (NDVI), and calculates total tons of CO2.
         │
         ▼
[ Step 3: Web3 ]      ──> Turns those CO2 tons into digital tokens on the Polygon blockchain.
         │
         ▼
[ Step 4: Market ]    ──> Companies buy & "retire" (burn) tokens, and download an official ESG PDF Certificate.
```

---

## 👥 Who Does What (The 4 Roles)

| Member | Your Role | What You Build | What You Pass to the Next Person |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Map & GIS Lead** | Map drawing tool & area checker | GPS Coordinates & Total Hectares |
| **Member 2** | **Satellite & Science Lead** | Satellite scanner & CO2 calculator | Total CO2 Tons & Audit Score |
| **Member 3** | **Web3 & Blockchain Lead** | Crypto token minter & IPFS storage | Minted Token ID & Blockchain Tx Hash |
| **Member 4** | **Marketplace & Dashboard Lead** | Storefront, ESG charts & PDF certificate | Downloadable Certificate & Burn Receipt |

---

## 🧑‍💻 Member 1: Map & GIS Lead

### What is your job?
You build the registration page where an NGO or government officer draws a boundary on a satellite map over their coastal mangrove project.

### Your Step-by-Step Checklist:
1. **Show a satellite map** using Leaflet.
2. **Let the user draw a polygon box** around their mangrove area (e.g. Sundarbans).
3. **Calculate the size** in hectares automatically.
4. **Check if the location is valid** (makes sure nobody tries to register a desert or a city by checking against the `CCN_cores.csv` coastal dataset).
5. **Pass the coordinates and hectares** to Member 2.

### Your Files:
- `src/components/Pillar1_Registration.tsx`
- `src/components/MapComponent.tsx`
- `src/services/spatialValidator.ts`

### 📺 Helpful YouTube Tutorials:
- **React Leaflet Maps Basics**: https://www.youtube.com/watch?v=290VgjkJogw
- **Drawing Polygons on Maps**: https://www.youtube.com/watch?v=ls_EUE1QVPo
- **Calculating Area on Maps (Turf.js)**: https://www.youtube.com/watch?v=kYI4xV9vLbc

---

## 🛰️ Member 2: Satellite MRV & Science Lead

### What is your job?
You take the GPS coordinates from Member 1, simulate/query Sentinel-2 satellite light bands, and calculate how much carbon is stored in that forest.

### Your Step-by-Step Checklist:
1. **Get satellite light bands** (Red, Green, Blue, Near-Infrared).
2. **Calculate NDVI (Greenness Score)**:
   - Formula: `(Near_Infrared - Red) / (Near_Infrared + Red)`
   - Higher number (0.7 to 0.9) = Healthy dense mangroves.
3. **Calculate Carbon**:
   - Above-ground tree weight (Biomass)
   - Below-ground root weight
   - Soil Organic Carbon (using `CCN_depthseries.csv` from dataset)
4. **Convert to Total CO2 Tons**: Multiply Total Carbon by `3.67`.
5. **Generate an Audit Fingerprint Hash** and pass the numbers to Member 3.

### Your Files:
- `src/components/Pillar2_Auditing.tsx`
- `src/services/satelliteAuditor.ts`

### 📺 Helpful YouTube Tutorials:
- **What is NDVI & Satellite Remote Sensing**: https://www.youtube.com/watch?v=rxOM3hncu7M
- **How Sentinel-2 Satellite Bands Work**: https://www.youtube.com/watch?v=0wQv7n332Bw
- **How Mangrove Carbon Calculations Work**: https://www.youtube.com/watch?v=N_Fh1-6fG1o

---

## ⛓️ Member 3: Web3 & Blockchain Lead

### What is your job?
You take the verified $\text{CO}_2$ numbers from Member 2 and turn them into digital Carbon Tokens on the Polygon blockchain so they can never be forged or duplicated.

### Your Step-by-Step Checklist:
1. **Save the audit dossier to IPFS** (decentralized storage) so anyone can verify the proof.
2. **Connect to MetaMask wallet** on the Polygon Amoy testnet.
3. **Mint the tokens**: For example, `124,716 tons of CO2 = 124,716 AegisCarbon Tokens`.
4. **Generate a blockchain transaction hash** that links to PolygonScan.
5. **Pass the minted project** to Member 4's marketplace.

### Your Files:
- `src/components/Pillar3_Tokenization.tsx`
- `src/services/web3Registry.ts`
- `src/components/Navbar.tsx` (Connect Wallet button)

### 📺 Helpful YouTube Tutorials:
- **Carbon Credit Smart Contracts Explained**: https://www.youtube.com/watch?v=gyMwXuJrbJQ
- **Connecting MetaMask to React in 10 Minutes**: https://www.youtube.com/watch?v=8wYd32lE7zY
- **Storing Data on IPFS**: https://www.youtube.com/watch?v=Vl3r0u1W-30

---

## 📊 Member 4: Marketplace, Dashboard & PDF Certificate Lead

### What is your job?
You build the online marketplace where companies (like Tata, Microsoft, Delta Airlines) browse projects, buy credits, retire/burn them for climate compliance, and download an official verified PDF certificate.

### Your Step-by-Step Checklist:
1. **Display project cards** with price per ton (e.g. `$28 / ton`), available credits, and location photos.
2. **Build a "Buy & Retire" popup** where a company enters how many tons they want to offset and their company name.
3. **On-Chain Burning**: Decrement available tokens so nobody can double-spend them.
4. **Generate a verified PDF Certificate** using `jspdf` featuring:
   - Certificate ID & Company Name
   - Total Tons Retired
   - Polygon Blockchain Burn Hash
   - Scannable QR Code
5. **Show ESG Analytics Charts** on the Enterprise Dashboard.

### Your Files:
- `src/components/Pillar4_Marketplace.tsx`
- `src/components/EnterpriseDashboard.tsx`
- `src/components/ESGCertificateModal.tsx`
- `src/services/certificateGenerator.ts`

### 📺 Helpful YouTube Tutorials:
- **How to Generate PDF in React (jsPDF)**: https://www.youtube.com/watch?v=11090333555
- **Building Clean Dashboard UI in React & Tailwind**: https://www.youtube.com/watch?v=F627pKNZfEU
- **React Modals and Popups**: https://www.youtube.com/watch?v=LyfR1LgGk9c

---

## 🗄️ How We Use the Dataset (`sih-dataset`)

The folder `C:\Users\Ruhaan\OneDrive\Desktop\sih-dataset` contains real scientific data from the Smithsonian Coastal Carbon Network:

- **`CCN_cores.csv`** (16,000+ real GPS locations) &bull; Used by **Member 1** to confirm that the drawn polygon is a real coastal mangrove site.
- **`CCN_depthseries.csv`** (Soil samples) &bull; Used by **Member 2** to calculate accurate soil carbon storage.
- **`CCN_plants.csv`** (Tree measurements) &bull; Used by **Member 2** to estimate tree biomass from height.

---

## 🌳 How the Team Works in Parallel (Git Branches)

Each member creates their own branch so nobody accidentally overwrites someone else's work:

- **Member 1**: `git checkout -b feature/pillar-1-spatial`
- **Member 2**: `git checkout -b feature/pillar-2-satellite-mrv`
- **Member 3**: `git checkout -b feature/pillar-3-web3-tokens`
- **Member 4**: `git checkout -b feature/pillar-4-marketplace-esg`

---

## 🚀 Final Step: Review & Integration by Antigravity

When all 4 of you finish your sections:
1. Merge your branches into `main`.
2. Open Antigravity and say:
   > *"Antigravity, Team Carbon has merged our work into main. Please review the whole app, run checks, and make sure everything is connected and working."*
3. I will test the entire flow from Pillar 1 (Map) to Pillar 4 (PDF Certificate) and ensure it's ready for hackathon presentation!
