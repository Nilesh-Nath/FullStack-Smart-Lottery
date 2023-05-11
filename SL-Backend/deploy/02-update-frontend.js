const fs = require("fs");
const { ethers, network } = require("hardhat");
const { abiFile, contractAddressFile } = require("../helper.config");

module.exports = async () => {
  console.log("Updating FrontEnd....");
  await updateAbi();
  await updateContractAddress();
  console.log("Completed!");
};

async function updateAbi() {
  const raffle = await ethers.getContract("Raffle");
  fs.writeFileSync(
    abiFile,
    raffle.interface.format(ethers.utils.FormatTypes.json)
  );
}

async function updateContractAddress() {
  const raffle = await ethers.getContract("Raffle");
  const currentAddress = JSON.parse(
    fs.readFileSync(contractAddressFile, "utf8")
  );
  if (network.config.chainId.toString() in currentAddress) {
    if (
      !currentAddress[network.config.chainId.toString()].includes(
        raffle.address
      )
    ) {
      currentAddress[network.config.chainId.toString()].push(raffle.address);
    }
  } else {
    currentAddress[network.config.chainId.toString()] = [raffle.address];
  }

  fs.writeFileSync(contractAddressFile, JSON.stringify(currentAddress));
}

module.exports.tags = ["all", "frontend"];
