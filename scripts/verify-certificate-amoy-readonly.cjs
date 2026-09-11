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

  console.log(`[Read-Only] Connected to Polygon Amoy: chainId=${chainId} (expected: 80002)`);
  console.log(`[Read-Only] Contract Address: ${deployment.contractAddress}`);

  const abi = [
    'function owner() view returns (address)',
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function getProject(uint256 tokenId) view returns (tuple(string projectId, string ipfsCid, bytes32 auditHash, uint256 tokenId, uint256 totalCredits, bool registered))',
    'event CarbonCreditsRetired(address indexed account, uint256 indexed tokenId, uint256 amount)',
    'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)'
  ];

  const contract = new ethers.Contract(deployment.contractAddress, abi, provider);

  // 1. Verify read-only state
  const owner = await contract.owner();
  console.log(`[Read-Only] On-Chain Owner: ${owner}`);
  console.log(`[Read-Only] Deployer Address: ${deployment.deployer}`);

  const tokenId = 7300511014531487208209184491691875089324748676569431105539752191596868391902n;
  const balance = await contract.balanceOf(deployment.deployer, tokenId);
  console.log(`[Read-Only] Deployer Balance for Pichavaram Token: ${balance.toString()} MGROV`);

  // 2. Verify deployment receipt on Polygon Amoy
  const deployReceipt = await provider.getTransactionReceipt(deployment.transactionHash);
  if (deployReceipt) {
    console.log(`[Read-Only] Deployed Receipt Verified: Block #${deployReceipt.blockNumber}, status=${deployReceipt.status}`);
  } else {
    console.log(`[Read-Only] Deployed receipt not found on RPC node.`);
  }

  // 3. Test event interface parsing
  const retiredTopic = contract.interface.getEvent('CarbonCreditsRetired').topicHash;
  console.log(`[Read-Only] CarbonCreditsRetired Event Topic: ${retiredTopic}`);
  console.log(`[Read-Only] Smart contract verification logic confirmed without sending any transactions.`);
}

main().catch((err) => {
  console.error('[Read-Only] Error during verification test:', err);
  process.exit(1);
});
