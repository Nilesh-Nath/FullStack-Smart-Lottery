//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Imports
/** Imports for Getting Random Numbers using Chainlinks VRF */

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

// Error Codes
error Raffle__NotEnoughEntraceFee();
error Raffle__RaffleNotOpen();
error Raffle_TransactionReverted();
error Raffle__UpKeepNotNeeded(
    uint256 raffleState,
    uint256 players,
    uint256 balance
);

/**
 * @title Smart Lottery
 * @author Nilesh Nath
 * description : It randomly picks the winner from the participants of the lotter and transfer all the
 *               funds to that address
 * @dev It uses Chainlink VRF version 2 and chainlink keepers
 */

contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
    // Enum
    enum raffleStates {
        OPEN,
        CALCULATING
    }

    // State Variables
    uint256 private immutable i_minimumEntryFee;
    raffleStates private s_raffleState;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoorinator;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 4;
    uint32 private constant NUM_WORDS = 1;
    uint64 private immutable i_subscriptionId;

    // Lottery Variables
    uint256 private s_lastTimeStamp;
    uint256 private immutable i_interval;
    address private s_winner;

    // Constructor
    constructor(
        uint256 minimumEntryFee,
        address vrfCoordinatorAddress,
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint64 subscriptionId,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorAddress) {
        i_minimumEntryFee = minimumEntryFee;
        i_vrfCoorinator = VRFCoordinatorV2Interface(vrfCoordinatorAddress);
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
        i_subscriptionId = subscriptionId;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    // Events
    event raffleEntered(address indexed player);
    event wordRequested(uint256 indexed requestId);
    event gotWinner(address indexed winner);

    // Functions
    function enterRaffle() public payable {
        if (msg.value < i_minimumEntryFee) {
            revert Raffle__NotEnoughEntraceFee();
        }
        if (s_raffleState != raffleStates.OPEN) {
            revert Raffle__RaffleNotOpen();
        }
        s_players.push(payable(msg.sender));
        emit raffleEntered(msg.sender);
    }

    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upKeepNeeded, ) = checkUpkeep("");
        if (!upKeepNeeded) {
            revert Raffle__UpKeepNotNeeded(
                uint256(s_raffleState),
                s_players.length,
                address(this).balance
            );
        }
        s_raffleState = raffleStates.CALCULATING;
        uint256 requestId = i_vrfCoorinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        emit wordRequested(requestId);
    }

    function fulfillRandomWords(
        uint256 /**requestId*/,
        uint256[] memory randomWords
    ) internal override {
        uint256 winnerIndex = randomWords[0] % s_players.length;
        address payable winner = s_players[winnerIndex];
        s_winner = winner;
        s_players = new address payable[](0);
        s_raffleState = raffleStates.OPEN;
        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle_TransactionReverted();
        }
        emit gotWinner(winner);
    }

    /**Following are the requirements that is to be completed for triggering Chainlink Keepers
     * 1.TimeStamp reach
     * 2.Enough Players in Lottery
     * 3.Enough Balance in Lottery
     * 4.Lottery in Open State
     */

    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        bool isOpen = (s_raffleState == raffleStates.OPEN);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = ((address(this).balance) > 0);
        bool isTime = (block.timestamp - s_lastTimeStamp) > i_interval;
        upkeepNeeded = (isOpen && hasBalance && hasPlayers && isTime);
        return (upkeepNeeded, "");
    }

    // Getters
    function getMinimumEntryFee() public view returns (uint256) {
        return i_minimumEntryFee;
    }

    function getRaffleState() public view returns (raffleStates) {
        return s_raffleState;
    }

    function getPlayers(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getWinner() public view returns (address) {
        return s_winner;
    }

    function getNumWords() public pure returns (uint256) {
        return NUM_WORDS;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getcallbackGasLimit() public view returns (uint32) {
        return i_callbackGasLimit;
    }

    function getkeyHash() public view returns (bytes32) {
        return i_keyHash;
    }

    function getsubscriptionId() public view returns (uint64) {
        return i_subscriptionId;
    }

    function getNumOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimeStamp() public view returns (uint256) {
        return block.timestamp;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
