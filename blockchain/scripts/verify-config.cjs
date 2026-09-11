const hre = require("hardhat");

async function main() {
  console.log("====================================================");
  console.log("AegisBlue - Polygon Amoy Pre-Deployment Health Check");
  console.log("====================================================");
  console.log(`Configured Network:   ${hre.network.name}`);
  console.log(`Configured Chain ID:  ${hre.network.config.chainId}`);
  console.log(`Configured RPC URL:   ${hre.network.config.url}`);

  const signers = await hre.ethers.getSigners();
  console.log(`Available Signers:    ${signers.length}`);

  if (signers.length === 0) {
    console.error("ERROR: No signers found. Verify AMOY_PRIVATE_KEY in .env");
    return;
  }

  const deployer = signers[0];
  console.log(`Deployer Address:     ${deployer.address}`);

  try {
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Deployer POL Balance: ${hre.ethers.formatEther(balance)} POL`);
    console.log("====================================================");
    console.log("Status: READY FOR LIVE AMOY DEPLOYMENT");
    console.log("====================================================");
  } catch (err) {
    console.error(`RPC Query Error: ${err.message}`);
    console.log("====================================================");
    console.log("Status: RPC CONNECTION FAILED");
    console.log("====================================================");
  }
}

main().catch(console.error);
