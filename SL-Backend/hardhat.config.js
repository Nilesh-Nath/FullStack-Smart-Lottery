require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKET_CAP_API_KEY = process.env.COINMARKET_CAP_API_KEY;

module.exports = {
  defaultNetworks: "hardhat",
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 4,
    },
  },
  namedAccounts: {
    deployer: {
      11155111: 0,
      31337: 0,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    noColors: true,
    outputFile: "gasReport.txt",
    currency: "USD",
    coinmarketcap: COINMARKET_CAP_API_KEY,
  },
  mocha: {
    timeout: 500000,
  },
};
