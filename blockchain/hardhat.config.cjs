// In Windows / corporate proxy environments, permit local network certificate interception
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Safely retrieve the deployer private key without throwing or leaking if not configured
const rawKey = (process.env.AMOY_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || "").trim();
const accounts = 
  (rawKey.length === 64 || rawKey.length === 66) && !rawKey.includes("your_")
    ? [rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`]
    : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          evmVersion: "cancun",
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC || process.env.POLYGON_AMOY_RPC_URL || "https://polygon-amoy.drpc.org",
      chainId: 80002,
      accounts: accounts,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};
