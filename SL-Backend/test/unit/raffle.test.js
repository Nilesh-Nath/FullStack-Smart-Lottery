const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const { networkConfig } = require("../../helper.config");
const chainId = network.config.chainId;

chainId == 31337
  ? describe("Raffle", () => {
      let deployer, Mock, raffle, minimumEntryFee, interval;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        raffle = await ethers.getContract("Raffle", deployer);
        Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
        minimumEntryFee = await raffle.getMinimumEntryFee();
        interval = await raffle.getInterval();
      });
      describe("Constructor", async () => {
        it("It should assign the value of the constructor properly! --> For Minimum Entry Fee", async () => {
          const minimumEntryFee = networkConfig[chainId]["minimumEntryFee"];
          const minimumEntryFeeFromContract = await raffle.getMinimumEntryFee();
          assert.equal(
            minimumEntryFee.toString(),
            minimumEntryFeeFromContract.toString()
          );
        });

        it("It should assign the value of the constructor properly! --> For callbackGasLimit", async () => {
          const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
          const callbackGasLimitFromContract =
            await raffle.getcallbackGasLimit();
          assert.equal(callbackGasLimit, callbackGasLimitFromContract);
        });

        it("It should assign the value of the constructor properly! --> For keyHash", async () => {
          const keyHash = networkConfig[chainId]["keyHash"];
          const keyHashFromContract = await raffle.getkeyHash();
          assert.equal(keyHash, keyHashFromContract);
        });

        it("It should assign the value of the constructor properly! --> For Interval", async () => {
          const interval = networkConfig[chainId]["interval"];
          const intervalFromContract = await raffle.getInterval();
          assert.equal(interval.toString(), intervalFromContract.toString());
        });
      });

      describe("Enter Raffle", async () => {
        it("It reverts the transaction if the player didn't paid enough ETH!", async () => {
          expect(raffle.enterRaffle()).to.be.revertedWith(
            "Raffle__NotEnoughEntraceFee()"
          );
        });

        it("Its should push the address of players in the array!", async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          const player = await raffle.getPlayers(0);
          assert.equal(player, deployer);
        });

        it("It should emit the event!", async () => {
          expect(raffle.enterRaffle({ value: minimumEntryFee })).to.emit(
            raffle,
            "raffleEntered"
          );
        });

        it("It should revert the transaction if raffle is Calculating!", async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]);
          expect(
            raffle.enterRaffle({ value: minimumEntryFee })
          ).to.be.revertedWith("Raffle__RaffleNotOpen");
        });
      });

      describe("checkUpkeep", () => {
        it("It should revert if the raffle is Calculating! ", async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]);
          const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upKeepNeeded);
        });

        it("it should revert if there are not enough players in the raffle!", async () => {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine");
          const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upKeepNeeded);
        });

        it("it should revert the transaction if people didn't paid enough in raffle!", async () => {
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upKeepNeeded);
        });

        it("it should revert if timestamp is not reached!", async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          const { upKeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(!upKeepNeeded);
        });

        it("It should return true if all conditions are met!", async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
          assert(upkeepNeeded);
        });
      });

      describe("PerformUpKeep", () => {
        it("It should revert the transaction if the upkeepNeeded is false", async () => {
          expect(
            await raffle.enterRaffle({ value: minimumEntryFee })
          ).to.be.revertedWith("Raffle__UpKeepNotNeeded");
        });

        it("It should change the state of raffle to Calculating!", async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          await raffle.performUpkeep([]);
          const raffleState = await raffle.getRaffleState();
          assert.equal(raffleState.toString(), "1");
        });

        it("It should emit the request ID!", async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
          expect(raffle.performUpkeep([])).to.emit(raffle, "wordRequested");
        });
      });

      describe("FulFill Random Words!", () => {
        beforeEach(async () => {
          await raffle.enterRaffle({ value: minimumEntryFee });
          await network.provider.send("evm_increaseTime", [
            interval.toNumber() + 1,
          ]);
          await network.provider.send("evm_mine", []);
        });

        it("It should only work if there is an RequestId", async () => {
          expect(Mock.fulfillRandomWords(0, raffle.address)).to.be.revertedWith(
            "nonexistent request"
          );
          expect(Mock.fulfillRandomWords(1, raffle.address)).to.be.revertedWith(
            "nonexistent request"
          );
        });

        it("It should emit,send balance to Winner and reset the players array!", async () => {
          const startingAddress = 1;
          const numOfAddress = 3;
          const accounts = await ethers.getSigners();
          for (
            let i = startingAddress;
            i < startingAddress + numOfAddress;
            i++
          ) {
            const connectedAccount = await raffle.connect(accounts[i]);
            await connectedAccount.enterRaffle({ value: minimumEntryFee });
          }

          const winnerb4balance = await accounts[1].getBalance();
          const lastTimeStamp = await raffle.getLastTimeStamp();
          await new Promise(async (resolve, reject) => {
            raffle.once("gotWinner", async () => {
              console.log("Got Winner Event Fired!");
              try {
                const recentWinner = await raffle.getWinner();
                const raffleState = await raffle.getRaffleState();
                const numOfPlayers = await raffle.getNumOfPlayers();
                const endingTimeStamp = await raffle.getLatestTimeStamp();
                const winnerAfterBalance = await accounts[1].getBalance();
                const contractBalance = await raffle.getContractBalance();
                assert.equal(raffleState.toString(), "0");
                assert.equal(numOfPlayers.toString(), "0");
                assert.equal(recentWinner.toString(), accounts[1].address);
                assert.isTrue(endingTimeStamp > lastTimeStamp);
                assert.equal(contractBalance.toString(), "0");
                assert.equal(
                  winnerAfterBalance.toString(),
                  winnerb4balance
                    .add(minimumEntryFee.mul(numOfAddress))
                    .add(minimumEntryFee)
                );
                resolve();
              } catch (error) {
                reject(error);
              }
            });
            const tx = await raffle.performUpkeep([]);
            const txReceipt = await tx.wait(1);
            await Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              raffle.address
            );
          });
        });
      });
    })
  : describe.skip;
