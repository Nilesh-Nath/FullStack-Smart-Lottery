const { ethers } = require("hardhat");

const networkConfig = {
  11155111: {
    name: "sepolia",
    minimumEntryFee: ethers.utils.parseEther("0.01"),
    vrfCoordinatorAddress: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    keyHash:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000",
    subscriptionId: "1903",
    interval: "30",
  },
  31337: {
    name: "hardhat",
    minimumEntryFee: ethers.utils.parseEther("0.01"),
    keyHash:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
    callbackGasLimit: "500000",
    interval: "30",
  },
};
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9;
const abiFile = "../SL-Frontend/simple-lottery/constraints/abi.json";
const contractAddressFile =
  "../SL-Frontend/simple-lottery/constraints/contractAddress.json";

module.exports = {
  networkConfig,
  BASE_FEE,
  GAS_PRICE_LINK,
  abiFile,
  contractAddressFile
};
