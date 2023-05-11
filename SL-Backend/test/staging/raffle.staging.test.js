const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const chainId = network.config.chainId;

chainId != 31337
  ? describe("Raffle", () => {
      let deployer, raffle, minimumEntryFee;
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        minimumEntryFee = await raffle.getMinimumEntryFee();
      });
      it("It should work with real chainLink keepers and VRF and give winner!", async () => {
        const accounts = await ethers.getSigners();
        await new Promise(async (resolve, reject) => {
          raffle.once("gotWinner", async () => {
            try {
              const recentWinner = await raffle.getWinner();
              const winnerAfterBalance = await accounts[0].getBalance();
              console.log(ethers.utils.formatEther(winnerAfterBalance));
              const raffleState = await raffle.getRaffleState();
              const numOfPlayers = await raffle.getNumOfPlayers();
              const lastTimeStamp = await raffle.getLastTimeStamp();
              const latestTimeStamp = await raffle.getLatestTimeStamp();
              assert.equal(recentWinner.toString(), accounts[0].address);
              assert.equal(numOfPlayers.toString(), "0");
              assert.equal(raffleState.toString(), "0");
              assert.isTrue(latestTimeStamp > lastTimeStamp);
              assert.equal(
                winnerAfterBalance.toString(),
                winnerB4Bal.add(minimumEntryFee).toString()
              );
              resolve();
            } catch (error) {
              reject(error);
            }
          });

          const tx = await raffle.enterRaffle({ value: minimumEntryFee });
          const txReceipt = await tx.wait(1);

          const winnerB4Bal = await accounts[0].getBalance();
          // Winner Before Balance Checked!
          console.log(ethers.utils.formatEther(winnerB4Bal.toString()));
        });
      });
    })
  : describe.skip;
