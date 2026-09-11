const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("====================================================");
  console.log("AegisBlue Carbon Credit - Deployment Pipeline");
  console.log(`Target Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId || "local"})`);
  console.log("====================================================");

  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    console.error("Error: No deployer account available.");
    console.error("For Polygon Amoy deployment, set AMOY_PRIVATE_KEY in your .env file.");
    process.exitCode = 1;
    return;
  }

  const deployer = signers[0];
  console.log(`Deployer Address: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Account Balance:  ${hre.ethers.formatEther(balance)} POL/ETH`);

  if (balance === 0n && hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.warn("WARNING: Deployer account balance is 0 POL. Transactions may fail on live networks.");
  }

  // Sensible initial ERC-1155 metadata URI template
  // Standard IPFS gateway URI template where {id} is replaced by the hex token ID
  const initialUri = process.env.INITIAL_METADATA_URI || "https://gateway.pinata.cloud/ipfs/{id}.json";
  const initialOwner = deployer.address;

  console.log(`\nDeploying AegisBlueCarbonCredit...`);
  console.log(`Constructor Argument [uri_]:         ${initialUri}`);
  console.log(`Constructor Argument [initialOwner]: ${initialOwner}`);

  const AegisBlueCarbonCredit = await hre.ethers.getContractFactory("AegisBlueCarbonCredit");
  const carbonCredit = await AegisBlueCarbonCredit.deploy(initialUri, initialOwner);

  console.log("Waiting for deployment transaction confirmation...");
  await carbonCredit.waitForDeployment();

  const contractAddress = await carbonCredit.getAddress();
  const deployTx = carbonCredit.deploymentTransaction();
  const txReceipt = deployTx ? await deployTx.wait(1) : null;
  const blockNumber = txReceipt ? txReceipt.blockNumber : null;

  console.log("\n====================================================");
  console.log("Deployment Successful!");
  console.log("====================================================");
  console.log(`Contract Name:     AegisBlueCarbonCredit`);
  console.log(`Contract Address:  ${contractAddress}`);
  console.log(`Transaction Hash:  ${deployTx ? deployTx.hash : "N/A"}`);
  console.log(`Block Number:      ${blockNumber || "Pending"}`);
  console.log(`Network:           ${hre.network.name}`);
  console.log(`Chain ID:          ${hre.network.config.chainId || 31337}`);
  console.log(`Deployer Address:  ${deployer.address}`);
  console.log("====================================================");

  // Save non-secret deployment record to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentRecord = {
    contractName: "AegisBlueCarbonCredit",
    contractAddress: contractAddress,
    transactionHash: deployTx ? deployTx.hash : null,
    blockNumber: blockNumber,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployer: deployer.address,
    initialOwner: initialOwner,
    initialUri: initialUri,
    deployedAt: new Date().toISOString()
  };

  const receiptPath = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(receiptPath, JSON.stringify(deploymentRecord, null, 2));
  console.log(`Deployment receipt saved to: deployments/${hre.network.name}.json`);

  // Etherscan / Polygonscan verification if applicable
  if (
    hre.network.name === "amoy" &&
    process.env.POLYGONSCAN_API_KEY &&
    process.env.POLYGONSCAN_API_KEY !== "your_polygonscan_api_key_here"
  ) {
    console.log("\nAttempting contract verification on PolygonScan...");
    try {
      console.log("Waiting 5 block confirmations for explorer indexing...");
      if (deployTx) {
        await deployTx.wait(5);
      }
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [initialUri, initialOwner],
      });
      console.log("Verification succeeded!");
    } catch (err) {
      console.log(`Verification notice: ${err.message || err}`);
    }
  } else if (hre.network.name === "amoy") {
    console.log("\nNote: Contract verification on PolygonScan skipped (POLYGONSCAN_API_KEY not configured).");
  }
}

main().catch((error) => {
  console.error("Deployment failed:", error.message || error);
  process.exitCode = 1;
});
