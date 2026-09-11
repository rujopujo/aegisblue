# 🌊 AegisBlue — Decentralized Blue Carbon MRV & Tokenization Engine
> **Smart India Hackathon (SIH 2026)** &bull; *Team Carbon*

[![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Polygon](https://img.shields.io/badge/Polygon-Amoy_Testnet-8247E5?logo=polygon&logoColor=white)](https://polygon.technology/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 💡 Overview

**AegisBlue** is an end-to-end Blue Carbon Digital MRV (Measurement, Reporting & Verification) and Carbon Credit Tokenization Platform. It replaces slow, error-prone human auditing of coastal mangrove ecosystems with automated satellite telemetry, ground-truth scientific soil/biomass models, on-chain minting, and corporate ESG retirement certificates.

---

## 🏛️ The 4 Pillars Architecture

```
[ Pillar 1: Map & GIS ]        NGO draws coastal project boundary over mangrove forest
          │                    (Checked against Smithsonian CCN coastal core dataset)
          ▼
[ Pillar 2: Satellite MRV ]    Sentinel-2 satellite scans canopy health (NDVI) & computes
          │                    Above-Ground Biomass, Soil Carbon, and Total CO2 tons
          ▼
[ Pillar 3: Web3 Tokens ]      Stores audit dossier on IPFS & mints ERC-1155 Carbon Tokens
          │                    on the Polygon Amoy blockchain
          ▼
[ Pillar 4: Marketplace ]      Corporates purchase & permanently burn credits with verified
                               ESG certificates (jsPDF + QR verification code)
```

---

## 📁 Repository Structure

The repository is organized into modular services with root-level orchestration:

```
aegisblue/
├── .dockerignore              # Docker build exclusions
├── .env.example               # Environment variables template
├── .gitignore                 # Monorepo git ignore rules
├── docker-compose.yml         # Multi-service container orchestrator
├── package.json               # Root workspace runner & orchestration scripts
├── README.md                  # Project overview and quick start guide
│
├── frontend/                  # React + TypeScript + Vite Web Application
│   ├── public/                # Static assets, hero imagery, and icons
│   ├── src/                   # React UI modules (Pillars 1–4, Maps, Dashboard)
│   ├── index.html             # HTML entry point
│   ├── package.json           # Frontend dependencies & scripts
│   ├── tailwind.config.js     # Tailwind styling configuration
│   ├── tsconfig.json          # TypeScript compiler config
│   └── vite.config.ts         # Vite build configuration
│
├── backend/                   # Python FastAPI Geospatial MRV Microservice
│   ├── data/                  # Smithsonian CCN coastal core GIS dataset
│   ├── services/              # Satellite MRV, spatial geometry, IPFS pinning
│   ├── tests/                 # Pytest automated test suites
│   ├── Dockerfile             # Backend container definition
│   ├── main.py                # FastAPI REST endpoints
│   ├── models.py              # Pydantic schemas & SQLite models
│   └── requirements.txt       # Python dependencies
│
├── blockchain/                # Solidity Smart Contracts & Polygon Amoy Pipelines
│   ├── contracts/             # ERC-1155 AegisBlueCarbonCredit contract
│   ├── deployments/           # Polygon Amoy & local deployment records
│   ├── scripts/               # Hardhat deployment & verification pipelines
│   ├── test/                  # Contract unit tests (34 test cases)
│   ├── hardhat.config.cjs     # Hardhat compiler & network config
│   └── package.json           # Web3 dependencies (Hardhat, Ethers, OpenZeppelin)
│
├── docker/                    # Docker & Nginx Production Configuration
│   ├── Dockerfile             # Multi-stage optimized frontend build
│   └── nginx.conf             # Production Nginx reverse proxy
│
└── docs/                      # Technical Documentation & Guides
    ├── TECH_STACK.md          # Architecture & technology specifications
    ├── docker_guide.md        # Team Docker integration manual
    ├── team_workflow.md       # 4-member role checklist & YouTube tutorials
    └── team_workflow.html     # Interactive visual workflow guide
```

---

## 🚀 Quick Start with Docker

The entire platform is fully containerized with multi-stage builds and Nginx caching:

```bash
# 1. Clone the repository
git clone https://github.com/rujopujo/aegisblue.git
cd aegisblue

# 2. Build and run container
docker compose up --build -d

# 3. Open in browser
# Navigate to: http://localhost:3000
```

To stop the container:
```bash
docker compose down
```

---

## 💻 Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Open in browser: http://localhost:5173

# Run contract tests
npm run test:contracts

# Run backend tests
npm run test:backend
```

---

## 👥 Team Carbon Documentation

For detailed architecture, role assignments, YouTube video links, and step-by-step checklists:
* 🌊 **[Technology Stack & Architecture Specification](docs/TECH_STACK.md)**
* 📖 **[Team Workflow Guide](docs/team_workflow.md)**
* 🐳 **[Docker Integration Guide](docs/docker_guide.md)**
* 🌐 **[Visual Workflow HTML](docs/team_workflow.html)**

