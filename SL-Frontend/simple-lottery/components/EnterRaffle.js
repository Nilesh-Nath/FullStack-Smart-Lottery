import { useWeb3Contract, useMoralis } from "react-moralis";
import { abi, contractAddress } from "../constraints/index.js";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "web3uikit";

export default function EnterRaffle() {
  const { chainId: chainIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chainIdHex);
  const raffleAddress =
    chainId in contractAddress ? contractAddress[chainId]["0"] : null;
  const [entryFee, setEntryFee] = useState("0");
  const [numOfPlayers, setNumOfPlayers] = useState("0");
  const [recentWinner, setWinner] = useState("0");

  const dispatch = useNotification();
  const { runContractFunction: getMinimumEntryFee } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getMinimumEntryFee",
    params: {},
  });

  const {
    runContractFunction: enterRaffle,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    params: {},
    msgValue: entryFee,
    functionName: "enterRaffle",
  });

  const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    params: {},
    functionName: "getNumOfPlayers",
  });

  const { runContractFunction: getWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    params: {},
    functionName: "getWinner",
  });

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUi();
    }
  }, [isWeb3Enabled]);

  async function updateUi() {
    const minimumEntryFeeFromCall = (await getMinimumEntryFee()).toString();
    const players = (await getNumOfPlayers()).toNumber();
    const winner = await getWinner();
    setEntryFee(minimumEntryFeeFromCall);
    setNumOfPlayers(players);
    setWinner(winner);
  }

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    await updateUi();
    handleNewSucess(tx);
  };

  const handleNewSucess = () => {
    dispatch({
      type: "info",
      message: "Transaction Complete!",
      title: "Transaction Notification!",
      position: "topR",
    });
  };

  return raffleAddress ? (
    <div className="p-5">
      <h1 className="py-4 px-4 font-bold text-3xl">Lottery</h1>
      <div>
        Minimum Entry Fee is : {ethers.utils.formatUnits(entryFee, "ether")}ETH
      </div>
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
          onClick={async () => {
            await enterRaffle({
              onSuccess: handleSuccess,
              onError: (error) => console.log(error),
            });
          }}
          disabled={isLoading || isFetching}
        >
          {isLoading || isFetching ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
          ) : (
            "Enter Raffle"
          )}
        </button>
      </div>
      <div>Total Numbers of Players are : {numOfPlayers}</div>
      <div>Recent Winner is : {recentWinner}</div>
    </div>
  ) : (
    <div>Please Connect To A Supported Chain!</div>
  );
}
