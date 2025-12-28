// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChessEscrow
 * @notice Trustless escrow for Web3 chess betting on Base
 * @dev Winner-takes-all chess betting with arbiter-based resolution
 *
 * Flow:
 * 1. Player 1 creates game with ETH stake
 * 2. Player 2 joins by matching the stake
 * 3. Game is played off-chain, moves validated by arbiter
 * 4. Arbiter calls completeGame with winner
 * 5. Winner claims the pot
 */
contract ChessEscrow {

    // ============ Constants ============

    uint256 public constant MIN_STAKE = 0.0001 ether;
    uint256 public constant MAX_STAKE = 10 ether;
    uint256 public constant TIMEOUT_PERIOD = 24 hours;
    uint256 public constant HOUSE_FEE_BPS = 0; // 0% fee - can be changed later

    // ============ State ============

    address public owner;
    address public arbiter;
    bool public paused;

    uint256 public totalGamesCreated;
    uint256 public totalGamesCompleted;
    uint256 public totalEthEscrowed;

    // ============ Structs ============

    enum GameStatus {
        Created,     // Waiting for player 2
        Active,      // Both players joined, game in progress
        Completed,   // Game finished
        Cancelled    // Game cancelled before start
    }

    enum GameResult {
        None,        // Game still in progress
        WhiteWins,   // Player 1 (white) won
        BlackWins,   // Player 2 (black) won
        Draw         // Game ended in draw
    }

    struct Game {
        bytes32 id;
        address player1;      // White
        address player2;      // Black
        uint256 stake;        // Per-player stake
        uint256 pot;          // Total ETH in escrow
        uint256 createdAt;
        uint256 startedAt;
        uint256 lastMoveAt;
        address currentTurn;
        GameStatus status;
        GameResult result;
        address winner;
        bool claimed;
    }

    // ============ Storage ============

    mapping(bytes32 => Game) public games;
    mapping(address => bytes32[]) public playerGames;
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerLosses;
    mapping(address => uint256) public playerDraws;
    mapping(address => uint256) public playerEthWon;

    // ============ Events ============

    event GameCreated(
        bytes32 indexed gameId,
        address indexed player1,
        uint256 stake
    );

    event GameJoined(
        bytes32 indexed gameId,
        address indexed player2
    );

    event GameStarted(bytes32 indexed gameId);

    event MoveMade(
        bytes32 indexed gameId,
        address indexed player
    );

    event GameCompleted(
        bytes32 indexed gameId,
        GameResult result,
        address indexed winner
    );

    event WinningsClaimed(
        bytes32 indexed gameId,
        address indexed claimer,
        uint256 amount
    );

    event GameCancelled(
        bytes32 indexed gameId,
        address indexed player
    );

    event TimeoutClaimed(
        bytes32 indexed gameId,
        address indexed claimer
    );

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyArbiter() {
        require(msg.sender == arbiter, "Only arbiter");
        _;
    }

    modifier notPaused() {
        require(!paused, "Contract paused");
        _;
    }

    modifier gameExists(bytes32 gameId) {
        require(games[gameId].player1 != address(0), "Game not found");
        _;
    }

    // ============ Constructor ============

    constructor(address _arbiter) {
        owner = msg.sender;
        arbiter = _arbiter;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new game with ETH stake
     * @param stake The stake amount (must match msg.value)
     * @return gameId The unique game identifier
     */
    function createGame(uint256 stake) external payable notPaused returns (bytes32) {
        require(msg.value == stake, "Incorrect ETH amount");
        require(stake >= MIN_STAKE && stake <= MAX_STAKE, "Invalid stake");

        bytes32 gameId = keccak256(abi.encodePacked(
            msg.sender,
            block.timestamp,
            blockhash(block.number - 1),
            totalGamesCreated
        ));

        require(games[gameId].player1 == address(0), "Game ID collision");

        games[gameId] = Game({
            id: gameId,
            player1: msg.sender,
            player2: address(0),
            stake: stake,
            pot: stake,
            createdAt: block.timestamp,
            startedAt: 0,
            lastMoveAt: 0,
            currentTurn: address(0),
            status: GameStatus.Created,
            result: GameResult.None,
            winner: address(0),
            claimed: false
        });

        playerGames[msg.sender].push(gameId);
        totalGamesCreated++;
        totalEthEscrowed += stake;

        emit GameCreated(gameId, msg.sender, stake);

        return gameId;
    }

    /**
     * @notice Join an existing game by matching the stake
     * @param gameId The game to join
     */
    function joinGame(bytes32 gameId) external payable notPaused gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.status == GameStatus.Created, "Game not joinable");
        require(game.player1 != msg.sender, "Cannot play yourself");
        require(msg.value == game.stake, "Incorrect stake");

        game.player2 = msg.sender;
        game.pot += msg.value;
        game.status = GameStatus.Active;
        game.startedAt = block.timestamp;
        game.lastMoveAt = block.timestamp;
        game.currentTurn = game.player1; // White moves first

        playerGames[msg.sender].push(gameId);
        totalEthEscrowed += msg.value;

        emit GameJoined(gameId, msg.sender);
        emit GameStarted(gameId);
    }

    /**
     * @notice Record a move (called by arbiter after validation)
     * @param gameId The game ID
     * @param player The player who made the move
     */
    function recordMove(
        bytes32 gameId,
        address player
    ) external onlyArbiter gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.status == GameStatus.Active, "Game not active");
        require(game.currentTurn == player, "Not player's turn");

        game.lastMoveAt = block.timestamp;
        game.currentTurn = (player == game.player1) ? game.player2 : game.player1;

        emit MoveMade(gameId, player);
    }

    /**
     * @notice Complete a game (called by arbiter)
     * @param gameId The game ID
     * @param result The game result
     * @param winner The winner address (address(0) for draw)
     */
    function completeGame(
        bytes32 gameId,
        GameResult result,
        address winner
    ) external onlyArbiter gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.status == GameStatus.Active, "Game not active");
        require(result != GameResult.None, "Invalid result");

        if (result == GameResult.Draw) {
            require(winner == address(0), "Draw has no winner");
        } else {
            require(
                winner == game.player1 || winner == game.player2,
                "Winner must be a player"
            );
        }

        game.status = GameStatus.Completed;
        game.result = result;
        game.winner = winner;

        // Update stats
        if (result == GameResult.Draw) {
            playerDraws[game.player1]++;
            playerDraws[game.player2]++;
        } else {
            address loser = (winner == game.player1) ? game.player2 : game.player1;
            playerWins[winner]++;
            playerLosses[loser]++;
        }

        totalGamesCompleted++;

        emit GameCompleted(gameId, result, winner);
    }

    /**
     * @notice Claim winnings after game completion
     * @param gameId The game ID
     */
    function claimWinnings(bytes32 gameId) external gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.status == GameStatus.Completed, "Game not completed");
        require(!game.claimed, "Already claimed");

        uint256 payout;

        if (game.result == GameResult.Draw) {
            // Each player gets half
            require(
                msg.sender == game.player1 || msg.sender == game.player2,
                "Not a player"
            );

            payout = game.pot / 2;

            // Mark as claimed only if both halves are distributed
            // For simplicity, we'll do single claim that sends to both
            game.claimed = true;
            totalEthEscrowed -= game.pot;

            uint256 half = game.pot / 2;

            (bool success1, ) = game.player1.call{value: half}("");
            require(success1, "Transfer to player1 failed");

            (bool success2, ) = game.player2.call{value: half}("");
            require(success2, "Transfer to player2 failed");

            emit WinningsClaimed(gameId, game.player1, half);
            emit WinningsClaimed(gameId, game.player2, half);
        } else {
            // Winner takes all
            require(msg.sender == game.winner, "Not the winner");

            game.claimed = true;
            totalEthEscrowed -= game.pot;

            // Apply house fee if any
            uint256 fee = (game.pot * HOUSE_FEE_BPS) / 10000;
            payout = game.pot - fee;

            playerEthWon[msg.sender] += payout;

            (bool success, ) = msg.sender.call{value: payout}("");
            require(success, "Transfer failed");

            if (fee > 0) {
                (bool feeSuccess, ) = owner.call{value: fee}("");
                require(feeSuccess, "Fee transfer failed");
            }

            emit WinningsClaimed(gameId, msg.sender, payout);
        }
    }

    /**
     * @notice Claim timeout victory if opponent abandoned
     * @param gameId The game ID
     */
    function claimTimeout(bytes32 gameId) external gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.status == GameStatus.Active, "Game not active");
        require(
            msg.sender == game.player1 || msg.sender == game.player2,
            "Not a player"
        );
        require(game.currentTurn != msg.sender, "It's your turn");
        require(
            block.timestamp >= game.lastMoveAt + TIMEOUT_PERIOD,
            "Timeout not reached"
        );

        game.status = GameStatus.Completed;
        game.result = (msg.sender == game.player1) ? GameResult.WhiteWins : GameResult.BlackWins;
        game.winner = msg.sender;

        // Update stats
        address loser = (msg.sender == game.player1) ? game.player2 : game.player1;
        playerWins[msg.sender]++;
        playerLosses[loser]++;
        totalGamesCompleted++;

        emit TimeoutClaimed(gameId, msg.sender);
        emit GameCompleted(gameId, game.result, msg.sender);
    }

    /**
     * @notice Cancel a game before opponent joins
     * @param gameId The game ID
     */
    function cancelGame(bytes32 gameId) external gameExists(gameId) {
        Game storage game = games[gameId];

        require(game.status == GameStatus.Created, "Game already started");
        require(msg.sender == game.player1, "Not the creator");

        game.status = GameStatus.Cancelled;
        totalEthEscrowed -= game.pot;

        (bool success, ) = msg.sender.call{value: game.pot}("");
        require(success, "Refund failed");

        emit GameCancelled(gameId, msg.sender);
    }

    // ============ View Functions ============

    function getGame(bytes32 gameId) external view returns (Game memory) {
        return games[gameId];
    }

    function getPlayerGames(address player) external view returns (bytes32[] memory) {
        return playerGames[player];
    }

    function getPlayerStats(address player) external view returns (
        uint256 wins,
        uint256 losses,
        uint256 draws,
        uint256 ethWon
    ) {
        return (
            playerWins[player],
            playerLosses[player],
            playerDraws[player],
            playerEthWon[player]
        );
    }

    function isGameTimedOut(bytes32 gameId) external view returns (bool) {
        Game storage game = games[gameId];
        if (game.status != GameStatus.Active || game.lastMoveAt == 0) {
            return false;
        }
        return block.timestamp >= game.lastMoveAt + TIMEOUT_PERIOD;
    }

    // ============ Admin Functions ============

    function setArbiter(address _arbiter) external onlyOwner {
        arbiter = _arbiter;
    }

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }

    // Emergency withdrawal only if no games are active
    function emergencyWithdraw() external onlyOwner {
        require(paused, "Must be paused");
        require(totalEthEscrowed == 0, "Active games exist");

        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = owner.call{value: balance}("");
            require(success, "Withdraw failed");
        }
    }

    // ============ Receive ============

    receive() external payable {
        revert("Use createGame or joinGame");
    }
}
