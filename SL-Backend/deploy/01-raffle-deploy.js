const { network, ethers } = require("hardhat");
const { networkConfig } = require("../helper.config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const minimumEntryFee = networkConfig[chainId]["minimumEntryFee"];
  const keyHash = networkConfig[chainId]["keyHash"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  let subscriptionId, vrfCoordinatorAddress;
  const interval = networkConfig[chainId]["interval"];
  const FUND_AMOUNT = ethers.utils.parseEther("30");
  if (chainId === 31337) {
    const mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorAddress = mock.address;
    const transactionResponse = await mock.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events[0].args.subId;
    mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    subscriptionId = networkConfig[chainId]["subscriptionId"];
    vrfCoordinatorAddress = networkConfig[chainId]["vrfCoordinatorAddress"];
  }
  const args = [
    minimumEntryFee,
    vrfCoordinatorAddress,
    keyHash,
    callbackGasLimit,
    subscriptionId,
    interval,
  ];
  log("Deploying Contract....");
  const raffle = await deploy("Raffle", {
    from: deployer,
    log: true,
    args: args,
    waitConfirmations: network.config.blockConfirmations,
  });
  log("Contract Deployed!");
  log("========================================");

  if (chainId == 31337) {
    // Ensure the Raffle contract is a valid consumer of the VRFCoordinatorV2Mock contract.
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    await vrfCoordinatorV2Mock.addConsumer(subscriptionId, raffle.address);
  }

  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(raffle.address, args);
  }
};

module.exports.tags = ["all", "raffle"];
