// In Windows / proxy environments, permit local network certificate handling
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const hre = require("hardhat");

/**
 * Deterministically derives a uint256 token ID from projectId using keccak256
 */
function deriveDeterministicTokenId(projectId) {
  const trimmed = projectId.trim();
  const hashHex = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(trimmed));
  const tokenBigInt = BigInt(hashHex);
  return tokenBigInt === 0n ? 1n : tokenBigInt;
}

/**
 * Ensures auditHash is a valid 32-byte hexadecimal string
 */
function formatBytes32Hash(hash) {
  let clean = (hash || "").trim();
  if (!clean.startsWith("0x")) {
    clean = "0x" + clean;
  }
  if (/^0x[0-9a-fA-F]{64}$/.test(clean)) {
    return clean;
  }
  return hre.ethers.keccak256(hre.ethers.toUtf8Bytes(clean));
}

async function main() {
  console.log("===============================================================");
  console.log("AegisBlue: Live Polygon Amoy End-to-End Tokenization Verification");
  console.log("===============================================================");

  const contractAddress = "0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9";
  const signers = await hre.ethers.getSigners();

  if (signers.length === 0) {
    throw new Error("No signer available. Verify AMOY_PRIVATE_KEY in .env");
  }

  const signer = signers[0];
  const signerAddress = await signer.getAddress();
  console.log(`[1] Connected Signer / Wallet:  ${signerAddress}`);

  const contractAbi = [
    "function owner() view returns (address)",
    "function balanceOf(address account, uint256 id) view returns (uint256)",
    "function getProject(uint256 tokenId) view returns (tuple(string projectId, string ipfsCid, bytes32 auditHash, uint256 tokenId, uint256 totalCredits, bool registered))",
    "function isProjectIdRegistered(string projectId) view returns (bool)",
    "function projectIdToTokenId(string projectId) view returns (uint256)",
    "function registerProject(string projectId, string ipfsCid, bytes32 auditHash, uint256 tokenId, uint256 totalCredits)",
    "function mint(address recipient, uint256 tokenId, uint256 amount)"
  ];

  const contract = new hre.ethers.Contract(contractAddress, contractAbi, signer);

  // 1. Dynamic Owner Verification
  console.log("\n[2] Verifying On-Chain Contract Owner Dynamically...");
  const onChainOwner = await contract.owner();
  console.log(`    Contract Address:          ${contractAddress}`);
  console.log(`    On-Chain Owner:            ${onChainOwner}`);
  console.log(`    Signer Address:            ${signerAddress}`);

  if (signerAddress.toLowerCase() !== onChainOwner.toLowerCase()) {
    throw new Error(
      `ABORT: Signer (${signerAddress}) does NOT match contract owner (${onChainOwner})!`
    );
  }
  console.log("    MATCH CONFIRMED: Signer is authorized contract owner.");

  const balance = await hre.ethers.provider.getBalance(signerAddress);
  console.log(`    Signer POL Balance:        ${hre.ethers.formatEther(balance)} POL`);

  // 2. Select and prepare mock project MRV data
  console.log("\n[3] Preparing AegisBlue Mock Project MRV Telemetry...");
  const projectName = "Pichavaram Estuarine Rhizophora Expansion";
  const ngoName = "Tamil Nadu Coastal Mangrove Trust";
  const locationName = "Pichavaram Mangrove Forest, Tamil Nadu";
  const areaHectares = 180;
  const rawAuditHash = "0xb3e89f1d0442ea7c552093e4811a2f689e401b2a95c3384210e7b8923a1c0d5f";
  const formattedAuditHash = formatBytes32Hash(rawAuditHash);
  const totalCredits = 100; // Testing with 100 credits to conserve gas

  const cleanSlug = projectName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16).toUpperCase();
  const projectId = `AEGIS-${cleanSlug}-${areaHectares}`;
  const tokenId = deriveDeterministicTokenId(projectId);

  console.log(`    Project Name:              ${projectName}`);
  console.log(`    Canonical Project ID:      ${projectId}`);
  console.log(`    Solidity uint256 Token ID: ${tokenId.toString()}`);
  console.log(`    Audit Hash:                ${formattedAuditHash}`);
  console.log(`    Credits to Mint:           ${totalCredits} MGROV`);

  // 3. Real IPFS Pinning via Backend
  console.log("\n[4] Calling Backend POST /api/ipfs/pin...");
  const pinPayload = {
    projectId: projectId,
    auditHash: formattedAuditHash,
    totalCredits: totalCredits,
    projectName: projectName,
    ngoName: ngoName,
    locationName: locationName,
    areaHectares: areaHectares,
    coordinates: [[11.42, 79.77], [11.42, 79.80], [11.45, 79.80], [11.45, 79.77], [11.42, 79.77]],
    customMetadata: {
      standard: "IPCC Wetlands Supplement (2013)",
      testRun: "Milestone 7 Live Verification"
    }
  };

  const ipfsResponse = await fetch("http://127.0.0.1:8000/api/ipfs/pin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pinPayload)
  });

  if (!ipfsResponse.ok) {
    const errorText = await ipfsResponse.text();
    throw new Error(`IPFS Pinning failed (${ipfsResponse.status}): ${errorText}`);
  }

  const pinResult = await ipfsResponse.json();
  const ipfsCid = pinResult.cid;
  const gatewayUrl = pinResult.gatewayUrl;
  console.log(`    IPFS CID:                  ${ipfsCid}`);
  console.log(`    Gateway URL:               ${gatewayUrl}`);

  // 4. Check whether project is already registered on-chain
  console.log("\n[5] Checking On-Chain Registration Status...");
  const isProjRegistered = await contract.isProjectIdRegistered(projectId);
  const projectMetadata = await contract.getProject(tokenId);

  let registrationTxHash = null;
  let registrationBlock = null;

  if (isProjRegistered || projectMetadata.registered) {
    console.log("    Project is ALREADY registered on-chain.");
    console.log(`    Existing CID:              ${projectMetadata.ipfsCid}`);
    console.log(`    Existing Total Credits:    ${projectMetadata.totalCredits.toString()}`);
  } else {
    console.log("    Project is NOT yet registered. Broadcasting registerProject transaction...");
    const regTx = await contract.registerProject(
      projectId,
      ipfsCid,
      formattedAuditHash,
      tokenId,
      totalCredits
    );
    console.log(`    Registration Tx Broadcast: ${regTx.hash}`);
    console.log("    Waiting for block confirmation on Polygon Amoy...");
    const regReceipt = await regTx.wait(1);
    registrationTxHash = regReceipt.hash;
    registrationBlock = regReceipt.blockNumber;
    console.log(`    CONFIRMED in Block:        #${registrationBlock}`);
  }

  // 5. Check Recipient Balance and Execute Mint
  console.log("\n[6] Checking Recipient Token Balance...");
  const recipient = signerAddress; // Minting to the authorized owner/beneficiary
  const currentBalance = await contract.balanceOf(recipient, tokenId);
  console.log(`    Current Balance:           ${currentBalance.toString()} MGROV`);

  let mintTxHash = null;
  let mintBlock = null;

  if (currentBalance >= BigInt(totalCredits)) {
    console.log("    Credits are ALREADY fully minted on-chain for this recipient.");
  } else {
    const toMint = BigInt(totalCredits) - currentBalance;
    console.log(`    Broadcasting mint transaction for ${toMint.toString()} MGROV to ${recipient}...`);
    const mintTx = await contract["mint(address,uint256,uint256)"](
      recipient,
      tokenId,
      toMint
    );
    console.log(`    Mint Tx Broadcast:         ${mintTx.hash}`);
    console.log("    Waiting for block confirmation on Polygon Amoy...");
    const mintReceipt = await mintTx.wait(1);
    mintTxHash = mintReceipt.hash;
    mintBlock = mintReceipt.blockNumber;
    console.log(`    CONFIRMED in Block:        #${mintBlock}`);
  }

  // 6. Verify final on-chain balance
  const updatedBalance = await contract.balanceOf(recipient, tokenId);
  console.log(`\n[7] Final On-Chain Balance:     ${updatedBalance.toString()} MGROV`);

  // 7. Final Summary & Explorer Links
  console.log("\n===============================================================");
  console.log("TOKENIZATION VERIFICATION SUMMARY");
  console.log("===============================================================");
  console.log(`Project ID:                    ${projectId}`);
  console.log(`Token ID (Solidity uint256):   ${tokenId.toString()}`);
  console.log(`IPFS CID:                      ${ipfsCid}`);
  console.log(`IPFS Gateway:                  ${gatewayUrl}`);
  if (registrationTxHash) {
    console.log(`Registration Tx Hash:          ${registrationTxHash}`);
    console.log(`Registration Explorer Link:    https://amoy.polygonscan.com/tx/${registrationTxHash}`);
  } else {
    console.log("Registration Tx Hash:          (Previously Confirmed on-chain)");
  }
  if (mintTxHash) {
    console.log(`Mint Tx Hash:                  ${mintTxHash}`);
    console.log(`Mint Explorer Link:            https://amoy.polygonscan.com/tx/${mintTxHash}`);
  } else {
    console.log("Mint Tx Hash:                  (Previously Confirmed on-chain)");
  }
  console.log(`Contract Explorer Link:        https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("===============================================================");
}

main().catch((err) => {
  console.error("\nEXECUTION FAILED:");
  console.error(err);
  process.exit(1);
});
