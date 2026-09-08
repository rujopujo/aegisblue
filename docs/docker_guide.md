# 🐳 Team Carbon: Docker Team Integration Guide
**SIH 2026 Hackathon** &bull; *Blue Carbon MRV & Tokenization Platform*

---

## 💡 How Docker Integrates Everyone's Work

Docker guarantees that when you merge your team's code, it will run identically on **every laptop** without errors or missing packages.

---

## 🎯 Case 1: All 4 Members Build Inside This Frontend (Recommended)

Because each teammate is assigned their own separate files, you will **never** overwrite each other's code.

### 👥 Who Owns Which Files:
| Member | Role | Files You Edit |
| :--- | :--- | :--- |
| **Member 1** | **Map & GIS Lead** | `src/components/Pillar1_Registration.tsx`<br>`src/components/MapComponent.tsx`<br>`src/services/spatialValidator.ts` |
| **Member 2** | **Satellite MRV & Science** | `src/components/Pillar2_Auditing.tsx`<br>`src/services/satelliteAuditor.ts` |
| **Member 3** | **Web3 & Blockchain** | `src/components/Pillar3_Tokenization.tsx`<br>`src/services/web3Registry.ts` |
| **Member 4** | **Marketplace & Dashboard** | `src/components/Pillar4_Marketplace.tsx`<br>`src/components/EnterpriseDashboard.tsx`<br>`src/components/ESGCertificateModal.tsx` |

### 🔄 How to Integrate in 3 Steps:
1. **Teammates clone the repository:**
   ```bash
   git clone https://github.com/rujopujo/aegisblue.git
   cd aegisblue
   ```
2. **Each member works on their branch and pushes their changes:**
   - Member 1: `git checkout -b feature/pillar-1-spatial`
   - Member 2: `git checkout -b feature/pillar-2-satellite-mrv`
   - Member 3: `git checkout -b feature/pillar-3-web3-tokens`
   - Member 4: `git checkout -b feature/pillar-4-marketplace-esg`
3. **Merge everyone into `main` and run Docker:**
   ```bash
   docker compose up --build -d
   ```
   **That is it!** Docker will automatically compile all 4 members' components into one unified application running at `http://localhost:3000`.

---

## 🐍 Case 2: If a Friend Builds a Separate Backend (Python / AI / Smart Contracts)

What if Member 2 or Member 1 decides to write a standalone **Python FastAPI / Flask** service for heavy satellite imagery or AI models?

Our `docker-compose.yml` is already prepared for this:

1. Tell your friend to create a folder called `backend/` in the project root:
   ```
   sih-2026/
   ├── backend/               <-- Your friend's code goes here
   │   ├── main.py
   │   ├── requirements.txt
   │   └── Dockerfile
   ├── docker/                <-- Dockerfile and nginx.conf
   ├── src/                   <-- React frontend (Pillars 1, 2, 3, 4)
   └── docker-compose.yml
   ```
2. In `backend/Dockerfile`, they add:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```
3. Open `docker-compose.yml` and **uncomment** the `satellite-backend` block.
4. Run `docker compose up --build -d`.  
   Docker spins up **both** the frontend (port `3000`) and the Python backend (port `8000`) together on the same private internal network!

---

## ⚡ Quick Cheat-Sheet

| Action | Command |
| :--- | :--- |
| **Start everything in background** | `docker compose up --build -d` |
| **Open the app** | Open browser to `http://localhost:3000` |
| **View real-time logs** | `docker compose logs -f` |
| **Stop everything** | `docker compose down` |
| **Force fresh rebuild without cache** | `docker compose build --no-cache` |

---

## 🛡️ Anti-Conflict Rules for the Team
1. **Never edit someone else's file** without telling them. If you need data from them, check `src/types/index.ts` to see the agreed data structure.
2. **Shared state is managed in `src/App.tsx`**: When Member 1 completes registration, it automatically hands data to Member 2, then Member 3, then Member 4.
3. If anyone adds a new `npm` library (e.g. `npm install chart.js`), make sure to commit both `package.json` and `package-lock.json`. Docker will install it automatically during build.
