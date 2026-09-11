const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
  const deploymentPath = path.join(__dirname, '..', 'deployments', 'amoy.json');
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  const rpcUrl = process.env.POLYGON_AMOY_RPC || 'https://polygon-amoy.drpc.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log(`[Read-Only] Connected to network: chainId=${chainId} (expected: 80002)`);

  const abi = [
    'function owner() view returns (address)',
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function getProject(uint256 tokenId) view returns (tuple(string projectId, string ipfsCid, bytes32 auditHash, uint256 tokenId, uint256 totalCredits, bool registered))',
    'function isProjectIdRegistered(string projectId) view returns (bool)'
  ];

  const contract = new ethers.Contract(deployment.contractAddress, abi, provider);

  const onChainOwner = await contract.owner();
  console.log(`[Read-Only] Contract Address: ${deployment.contractAddress}`);
  console.log(`[Read-Only] On-Chain Owner: ${onChainOwner}`);
  console.log(`[Read-Only] Deployer Address: ${deployment.deployer}`);
  console.log(`[Read-Only] Owner matches deployer: ${onChainOwner.toLowerCase() === deployment.deployer.toLowerCase()}`);

  const tokenId = 7300511014531487208209184491691875089324748676569431105539752191596868391902n;
  const deployerBalance = await contract.balanceOf(deployment.deployer, tokenId);
  console.log(`[Read-Only] Pichavaram Token ID: ${tokenId.toString()}`);
  console.log(`[Read-Only] Deployer Balance: ${deployerBalance.toString()} MGROV`);

  const projectMeta = await contract.getProject(tokenId);
  console.log(`[Read-Only] Registered Project ID: ${projectMeta.projectId}`);
  console.log(`[Read-Only] Project Registered Flag: ${projectMeta.registered}`);
  console.log(`[Read-Only] Project Total Credits: ${projectMeta.totalCredits.toString()} MGROV`);
}

main().catch((err) => {
  console.error('[Read-Only] Error during Amoy check:', err);
  process.exit(1);
});
