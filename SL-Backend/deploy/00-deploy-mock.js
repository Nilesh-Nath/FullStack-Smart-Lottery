const { network } = require("hardhat");
const { BASE_FEE, GAS_PRICE_LINK } = require("../helper.config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const args = [BASE_FEE, GAS_PRICE_LINK];
  if (chainId === 31337) {
    log("Local Host Detected! Deploying Mocks....");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });
    log("Mock Deployed!");
    log("========================================");
  }
};

module.exports.tags = ["all", "mock"];
