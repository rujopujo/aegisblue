import { BrowserProvider, Contract, ContractRunner, JsonRpcProvider, isAddress, keccak256, toUtf8Bytes } from 'ethers';
import {
  LatLng,
  SatelliteBandData,
  CarbonAuditMetrics,
  IPFSMetaPayload,
  TokenizedProject,
  RetirementRecord,
} from '../types';

export const POLYGON_AMOY_CONFIG = {
  chainId: 80002,
  chainIdHex: '0x13882',
  networkName: 'Polygon Amoy Testnet',
  rpcUrl: 'https://polygon-amoy.drpc.org',
  currencySymbol: 'POL',
  currencyName: 'POL',
  decimals: 18,
  blockExplorer: 'https://amoy.polygonscan.com',
  contractAddress: '0x4512a958E2F6a1ff0b6cc0F2F24a50C583A842d9',
  standard: 'ERC-1155 (Fractionalized Blue Carbon Credit Protocol)',
};

/**
 * Minimum ABI for AegisBlueCarbonCredit ERC-1155 contract on Polygon Amoy
 */
export const AEGIS_BLUE_ABI = [
  'function owner() view returns (address)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function getProject(uint256 tokenId) view returns (tuple(string projectId, string ipfsCid, bytes32 auditHash, uint256 tokenId, uint256 totalCredits, bool registered))',
  'function registerProject(string projectId, string ipfsCid, bytes32 auditHash, uint256 tokenId, uint256 totalCredits)',
  'function mint(address recipient, uint256 tokenId, uint256 amount)',
  'function retire(uint256 tokenId, uint256 amount)',
  'function isProjectIdRegistered(string projectId) view returns (bool)',
  'function projectIdToTokenId(string projectId) view returns (uint256)',
  'event ProjectRegistered(uint256 indexed tokenId, string projectId, string ipfsCid, bytes32 auditHash, uint256 totalCredits)',
  'event CarbonCreditsMinted(address indexed recipient, uint256 indexed tokenId, uint256 amount, address indexed minter)',
  'event CarbonCreditsRetired(address indexed account, uint256 indexed tokenId, uint256 amount)'
];

export interface Web3AccountState {
  address: string;
  chainId: number;
  isCorrectNetwork: boolean;
}

/**
 * Verifies if window.ethereum (MetaMask or EIP-1193 provider) is present
 */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).ethereum);
}

/**
 * Returns raw EIP-1193 provider from window.ethereum
 */
export function getEthereumProvider(): any {
  if (typeof window !== 'undefined') {
    return (window as any).ethereum;
  }
  return null;
}

/**
 * Returns an ethers BrowserProvider wrapping window.ethereum
 */
export function getBrowserProvider(): BrowserProvider | null {
  const eth = getEthereumProvider();
  if (!eth) return null;
  return new BrowserProvider(eth);
}

/**
 * Returns a fallback readonly JsonRpcProvider for Polygon Amoy
 */
export function getReadonlyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(POLYGON_AMOY_CONFIG.rpcUrl);
}

/**
 * Returns an ethers Contract instance connected to either a runner (Signer/BrowserProvider) or readonly provider
 */
export function getContract(runner?: ContractRunner): Contract {
  return new Contract(
    POLYGON_AMOY_CONFIG.contractAddress,
    AEGIS_BLUE_ABI,
    runner || getReadonlyProvider()
  );
}

/**
 * Deterministically derives a non-zero Solidity uint256 token ID from a projectId.
 * If projectId is already a decimal number, that number is preserved.
 * Otherwise, keccak256 of the normalized projectId string is computed.
 */
export function deriveDeterministicTokenId(projectId: string): bigint {
  const trimmed = projectId.trim();
  if (/^\d+$/.test(trimmed)) {
    const num = BigInt(trimmed);
    if (num > 0n && num < 2n ** 256n) {
      return num;
    }
  }
  const hashHex = keccak256(toUtf8Bytes(trimmed));
  const tokenBigInt = BigInt(hashHex);
  return tokenBigInt === 0n ? 1n : tokenBigInt;
}

/**
 * Validates and converts an audit hash to an exact Solidity bytes32 hex string (0x + 64 hex chars).
 */
export function formatBytes32Hash(hash: string): string {
  let clean = (hash || '').trim();
  if (!clean.startsWith('0x')) {
    clean = '0x' + clean;
  }
  if (/^0x[0-9a-fA-F]{64}$/.test(clean)) {
    return clean;
  }
  return keccak256(toUtf8Bytes(clean));
}

/**
 * Fetches the contract owner address
 */
export async function getContractOwner(runner?: ContractRunner): Promise<string> {
  const contract = getContract(runner);
  return await contract.owner();
}

/**
 * Fetches the credit balance for an account and tokenId
 */
export async function getTokenBalance(
  account: string,
  tokenId: bigint,
  runner?: ContractRunner
): Promise<bigint> {
  const contract = getContract(runner);
  return await contract.balanceOf(account, tokenId);
}

/**
 * Inspects whether a tokenId is already registered on-chain
 */
export async function checkProjectRegistration(
  tokenId: bigint,
  runner?: ContractRunner
): Promise<{
  registered: boolean;
  projectId: string;
  ipfsCid: string;
  auditHash: string;
  totalCredits: bigint;
}> {
  const contract = getContract(runner);
  try {
    const proj = await contract.getProject(tokenId);
    return {
      registered: Boolean(proj.registered),
      projectId: proj.projectId || '',
      ipfsCid: proj.ipfsCid || '',
      auditHash: proj.auditHash || '',
      totalCredits: BigInt(proj.totalCredits || 0n),
    };
  } catch (_err) {
    return {
      registered: false,
      projectId: '',
      ipfsCid: '',
      auditHash: '',
      totalCredits: 0n,
    };
  }
}

/**
 * Checks whether a projectId is registered on-chain, and returns its assigned tokenId if registered
 */
export async function checkProjectIdRegistered(
  projectId: string,
  runner?: ContractRunner
): Promise<{ registered: boolean; tokenId: bigint }> {
  const contract = getContract(runner);
  try {
    const isReg = await contract.isProjectIdRegistered(projectId);
    if (isReg) {
      const existingTokenId = await contract.projectIdToTokenId(projectId);
      return { registered: true, tokenId: BigInt(existingTokenId) };
    }
    return { registered: false, tokenId: 0n };
  } catch (_err) {
    return { registered: false, tokenId: 0n };
  }
}

/**
 * Formats Web3 / ethers error into human-readable, clear user explanation
 */
export function formatWeb3ErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred.';
  const msg = error.message || String(error);

  if (
    error.code === 'ACTION_REJECTED' ||
    error.info?.error?.code === 4001 ||
    msg.includes('user rejected') ||
    msg.includes('User denied')
  ) {
    return 'Transaction was rejected in MetaMask. Please approve the prompt in MetaMask to proceed.';
  }

  if (
    error.code === 'INSUFFICIENT_FUNDS' ||
    msg.includes('insufficient funds') ||
    msg.includes('exceeds balance')
  ) {
    return 'Insufficient POL balance in your wallet for gas fees on Polygon Amoy. Please acquire testnet POL from the Polygon faucet.';
  }

  if (msg.includes('Access Denied') || msg.includes('not the contract owner')) {
    return msg;
  }

  if (msg.includes('ProjectAlreadyRegistered')) {
    return 'This project ID has already been registered on-chain.';
  }

  if (msg.includes('TokenIdAlreadyRegistered')) {
    return 'This token ID has already been registered on-chain.';
  }

  if (msg.includes('ProjectNotRegistered')) {
    return 'Project must be registered on-chain before tokens can be minted.';
  }

  if (msg.includes('InvalidRecipient')) {
    return 'Invalid recipient address provided for token minting.';
  }

  if (msg.includes('network') || msg.includes('chain')) {
    return `Network error: ${msg}. Please ensure your MetaMask is connected to Polygon Amoy (Chain ID 80002).`;
  }

  return msg.length > 200 ? `${msg.slice(0, 200)}...` : msg;
}

/**
 * Executes on-chain project registration with the connected MetaMask signer
 */
export async function registerOnChainProject(
  projectId: string,
  ipfsCid: string,
  auditHash: string,
  tokenId: bigint,
  totalCredits: number
): Promise<{ txHash: string; blockNumber: number }> {
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error('MetaMask is not detected. Please install or connect MetaMask.');
  }

  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const contract = getContract(signer);

  // Validate owner
  const ownerAddress = await contract.owner();
  if (signerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error(
      `Access Denied: Connected wallet (${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)}) is not the contract owner (${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}). Only the designated AegisBlue Registry Owner can register projects.`
    );
  }

  const formattedAuditHash = formatBytes32Hash(auditHash);
  const totalCreditsBigInt = BigInt(Math.round(totalCredits));

  if (totalCreditsBigInt <= 0n) {
    throw new Error('Total credits must be greater than 0.');
  }

  const tx = await contract.registerProject(
    projectId,
    ipfsCid,
    formattedAuditHash,
    tokenId,
    totalCreditsBigInt
  );

  const receipt = await tx.wait(1);
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Executes on-chain ERC-1155 token minting with the connected MetaMask signer
 */
export async function mintOnChainCredits(
  recipientAddress: string,
  tokenId: bigint,
  amount: number
): Promise<{ txHash: string; blockNumber: number }> {
  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error('MetaMask is not detected. Please install or connect MetaMask.');
  }

  const signer = await provider.getSigner();
  const signerAddress = await signer.getAddress();
  const contract = getContract(signer);

  // Validate owner
  const ownerAddress = await contract.owner();
  if (signerAddress.toLowerCase() !== ownerAddress.toLowerCase()) {
    throw new Error(
      `Access Denied: Connected wallet (${signerAddress.slice(0, 6)}...${signerAddress.slice(-4)}) is not the contract owner (${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}). Only the designated AegisBlue Registry Owner can mint carbon credits.`
    );
  }

  const amountBigInt = BigInt(Math.round(amount));
  if (amountBigInt <= 0n) {
    throw new Error('Mint amount must be greater than 0.');
  }

  let finalRecipient = (recipientAddress || '').trim();
  if (!isAddress(finalRecipient)) {
    finalRecipient = signerAddress;
  }

  const tx = await contract['mint(address,uint256,uint256)'](
    finalRecipient,
    tokenId,
    amountBigInt
  );

  const receipt = await tx.wait(1);
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}


/**
 * Switches MetaMask to Polygon Amoy (chainId 80002 / 0x13882), requesting wallet_addEthereumChain if not present
 */
export async function switchToPolygonAmoy(): Promise<void> {
  const eth = getEthereumProvider();
  if (!eth) {
    throw new Error('MetaMask is not installed.');
  }

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: POLYGON_AMOY_CONFIG.chainIdHex }],
    });
  } catch (switchError: any) {
    // Error code 4902 indicates chain has not been added to MetaMask
    if (switchError?.code === 4902 || switchError?.message?.includes('Unrecognized chain')) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: POLYGON_AMOY_CONFIG.chainIdHex,
            chainName: POLYGON_AMOY_CONFIG.networkName,
            nativeCurrency: {
              name: POLYGON_AMOY_CONFIG.currencyName,
              symbol: POLYGON_AMOY_CONFIG.currencySymbol,
              decimals: POLYGON_AMOY_CONFIG.decimals,
            },
            rpcUrls: [POLYGON_AMOY_CONFIG.rpcUrl, 'https://rpc-amoy.polygon.technology'],
            blockExplorerUrls: [POLYGON_AMOY_CONFIG.blockExplorer],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Checks if user is already connected to MetaMask without prompting a popup
 */
export async function checkExistingConnection(): Promise<Web3AccountState | null> {
  const eth = getEthereumProvider();
  if (!eth) return null;

  try {
    const accounts: string[] = await eth.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      return null;
    }

    const provider = new BrowserProvider(eth);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    return {
      address: accounts[0],
      chainId,
      isCorrectNetwork: chainId === POLYGON_AMOY_CONFIG.chainId,
    };
  } catch (_err) {
    return null;
  }
}

/**
 * Prompts user for wallet authorization via eth_requestAccounts and enforces Polygon Amoy network
 */
export async function connectBrowserWallet(): Promise<Web3AccountState> {
  const eth = getEthereumProvider();
  if (!eth) {
    throw new Error('MetaMask is not detected. Please install the MetaMask browser extension.');
  }

  // Request user account authorization
  const accounts: string[] = await eth.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts selected in wallet.');
  }

  const provider = new BrowserProvider(eth);
  let network = await provider.getNetwork();
  let chainId = Number(network.chainId);

  if (chainId !== POLYGON_AMOY_CONFIG.chainId) {
    await switchToPolygonAmoy();
    const updatedNetwork = await provider.getNetwork();
    chainId = Number(updatedNetwork.chainId);
  }

  return {
    address: accounts[0],
    chainId,
    isCorrectNetwork: chainId === POLYGON_AMOY_CONFIG.chainId,
  };
}

/**
 * Subscribes to MetaMask EIP-1193 events (accountsChanged, chainChanged)
 */
export function subscribeToWalletEvents(
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainIdHex: string) => void
): () => void {
  const eth = getEthereumProvider();
  if (!eth || !eth.on) return () => {};

  eth.on('accountsChanged', onAccountsChanged);
  eth.on('chainChanged', onChainChanged);

  return () => {
    if (eth.removeListener) {
      eth.removeListener('accountsChanged', onAccountsChanged);
      eth.removeListener('chainChanged', onChainChanged);
    }
  };
}

/**
 * Creates deterministic pseudo-IPFS CID (v1 bafy...) from object content (Preserved for synchronous mock seeding)
 */
export function generateIPFSCID(data: unknown): string {
  const jsonString = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `bafybeih${hex}7z9w2qm4k8n2v9d1x5l0p4w8q2m9b7c1`;
}

/**
 * Generates deterministic Web3 Transaction Hash (Preserved for synchronous mock seeding)
 */
export function generateTxHash(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(12, 'e7b1a9');
  return `0x${hex}98f2c3a71b402e8d91c53b2a704e6f1a8c3d7e5b2901a`;
}

/**
 * Bundles project coordinates, Sentinel-2 spectral data, and MRV math into IPFS package
 */
export function createIPFSPackage(
  projectId: string,
  projectName: string,
  ngoName: string,
  coordinates: LatLng[],
  areaHectares: number,
  gmwZoneId: string,
  spectral: SatelliteBandData,
  audit: CarbonAuditMetrics
): IPFSMetaPayload {
  const metadata = {
    projectId,
    projectName,
    ngoName,
    coordinates,
    areaHectares,
    gmwZoneId,
    spectralData: spectral,
    carbonAudit: audit,
    scientificModel: 'IPCC Wetlands Supplement (2013) & Komiyama Allometric Canopy Math',
    allometricEquation: 'AGB = 115.0 * (NDVI)^1.8 * (H/8.0)^0.85 * 0.65; BGB = 0.49 * AGB',
    stoichiometricRatio: 'CO2e = Total Organic Carbon * (44/12)',
    auditSignature: audit.auditHash,
  };

  const cid = generateIPFSCID(metadata);

  return {
    cid,
    gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
    payloadSizeKb: Math.round((JSON.stringify(metadata).length / 1024) * 10) / 10,
    pinnedAt: new Date().toISOString(),
    metadata,
  };
}

/**
 * Mints ERC-1155 fractionalized carbon credits on Polygon Amoy (Preserved for synchronous mock seeding)
 */
export function mintCarbonTokens(
  projectData: {
    id: string;
    name: string;
    ngoName: string;
    ngoWallet?: string;
    ngoRegistrationNo?: string;
    locationName: string;
    coordinates: LatLng[];
    areaHectares: number;
    boundaryResult: any;
    spectralData: SatelliteBandData;
    carbonMetrics: CarbonAuditMetrics;
    ipfs: IPFSMetaPayload;
    pricePerTonUSD?: number;
    coBenefits?: string[];
  }
): TokenizedProject {
  const totalTons = projectData.carbonMetrics.projectTotalCO2Tons;
  const tokenId = `MGROV-${projectData.id.slice(-6).toUpperCase()}-${new Date().getFullYear()}`;
  const txHash = generateTxHash(`${projectData.id}-${totalTons}-${projectData.ipfs.cid}`);
  const blockNumber = 14892000 + Math.floor(Math.random() * 50000);

  return {
    id: projectData.id,
    name: projectData.name,
    ngoName: projectData.ngoName,
    ngoWallet: projectData.ngoWallet || '0x71C...9E34',
    ngoRegistrationNo: projectData.ngoRegistrationNo || 'NGO/WB/2021/88492',
    locationName: projectData.locationName,
    coordinates: projectData.coordinates,
    areaHectares: projectData.areaHectares,
    boundaryResult: projectData.boundaryResult,
    spectralData: projectData.spectralData,
    carbonMetrics: projectData.carbonMetrics,
    ipfs: projectData.ipfs,
    tokenization: {
      tokenId,
      contractAddress: POLYGON_AMOY_CONFIG.contractAddress,
      network: POLYGON_AMOY_CONFIG.networkName,
      totalMinted: totalTons,
      availableCredits: totalTons,
      retiredCredits: 0,
      pricePerTonUSD: projectData.pricePerTonUSD || 28.5,
      txHash,
      blockNumber,
      mintedAt: new Date().toISOString(),
    },
    coBenefits: projectData.coBenefits || [
      'Biodiversity & Bengal Tiger Habitat Protection',
      'Coastal Storm Surge & Cyclone Resilience',
      'Empowerment of 1,200+ Coastal Fisherwomen',
      'Marine Nursery for Mud Crabs & Estuarine Fish',
    ],
    status: 'LISTED',
  };
}

/**
 * Simulates on-chain Credit Retirement (Burning) on Polygon Amoy (Preserved for synchronous mock seeding)
 */
export function executeTokenRetirement(
  project: TokenizedProject,
  tonsToRetire: number,
  companyName: string,
  companyWallet: string,
  purpose: string
): { updatedProject: TokenizedProject; retirementRecord: RetirementRecord } {
  if (tonsToRetire > project.tokenization.availableCredits) {
    throw new Error('Retirement exceeds available carbon credits in pool.');
  }

  const burnTxHash = generateTxHash(`BURN-${project.id}-${companyName}-${tonsToRetire}-${Date.now()}`);
  const certificateId = `ESG-NETZERO-${Math.random().toString(36).substring(2, 9).toUpperCase()}-2026`;
  const burnBlock = project.tokenization.blockNumber + Math.floor(Math.random() * 2000) + 10;

  const retirementRecord: RetirementRecord = {
    id: `RET-${Date.now().toString().slice(-6)}`,
    projectId: project.id,
    projectName: project.name,
    companyName,
    companyWallet,
    tonsRetired: tonsToRetire,
    purpose,
    vintageYear: 2026,
    txHash: burnTxHash,
    burnReceiptBlock: burnBlock,
    retiredAt: new Date().toISOString(),
    certificateId,
    ipfsCertificateCid: `bafybeig${Math.random().toString(36).slice(2, 10)}burncert77x1`,
  };

  const updatedProject: TokenizedProject = {
    ...project,
    tokenization: {
      ...project.tokenization,
      availableCredits: project.tokenization.availableCredits - tonsToRetire,
      retiredCredits: project.tokenization.retiredCredits + tonsToRetire,
    },
  };

  return { updatedProject, retirementRecord };
}
