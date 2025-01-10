"use client";

import { useGame } from "@/context/GameContext";
import { getMoveString } from "@/helpers/getMoveString";
import { RPS_CONTRACT } from "@/lib/contracts/rps";
import { GameState, Move } from "@/types/types";
import { useEffect, useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

export function Player2Step() {
  const [selectedMove, setSelectedMove] = useState<Move>(Move.Rock);
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { currentGame, refreshGame } = useGame();
  const [isJoining, setIsJoining] = useState(false);
  const { address } = useAccount();

  const handleJoinGame = async () => {
    setIsJoining(true);
    try {
      if (!walletClient || !publicClient) return;

      await walletClient.writeContract({
        address: currentGame?.contractAddress as `0x${string}`,
        abi: RPS_CONTRACT.abi,
        functionName: "play",
        args: [selectedMove],
        value: parseEther(currentGame!.stakeAmount),
      });

      await fetch("/api/game/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState: GameState.WAITING_FOR_REVEAL,
          player2Move: selectedMove,
        }),
      });
      refreshGame();
    } catch (error) {
      console.error("Error joining game:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      {currentGame && currentGame?.gameState ? (
        currentGame.gameState === GameState.WAITING_FOR_PLAYER2 ? (
          <div className="p-6 bg-slate-800 rounded-lg space-y-4">
            <h3 className="text-xl font-bold">You are invited to play!</h3>

            <div className="space-y-2">
              <p className="text-sm text-slate-300">Game Info:</p>
              <p>Invited by: {currentGame?.player1}</p>
              <p>Staked amount: {currentGame?.stakeAmount} ETH</p>
              <p>
                Contract:{" "}
                <a
                  href={`https://sepolia.etherscan.io/address/${currentGame?.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {currentGame?.contractAddress}
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Choose Your Move
              </label>
              <select
                value={selectedMove}
                onChange={(e) =>
                  setSelectedMove(Number(e.target.value) as Move)
                }
                className="w-full p-2 bg-slate-700 rounded border border-slate-600"
              >
                <option value={Move.Rock}>Rock</option>
                <option value={Move.Paper}>Paper</option>
                <option value={Move.Scissors}>Scissors</option>
                <option value={Move.Spock}>Spock</option>
                <option value={Move.Lizard}>Lizard</option>
              </select>
            </div>

            <button
              onClick={handleJoinGame}
              disabled={isJoining}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Joining...
                </>
              ) : (
                "Join Game"
              )}
            </button>
          </div>
        ) : currentGame.gameState === GameState.WAITING_FOR_REVEAL ? (
          <div className="p-6 bg-slate-800 rounded-lg text-center">
            <h3 className="text-xl font-bold mb-4">Waiting for Player 1</h3>
            <p className="text-slate-300">
              Hold on while Player 1 reveals their move...
            </p>
            <p>Your move: {getMoveString(currentGame?.player2Move as Move)}</p>
          </div>
        ) : null
      ) : null}

      {currentGame?.gameState === GameState.COMPLETED && (
        <div className="p-6 bg-slate-800 rounded-lg space-y-4 text-center">
          <h3 className="text-xl font-bold">GAME COMPLETED</h3>
          <div className="space-y-2">
            <p>
              Amount{" "}
              {currentGame.winner === "Draw"
                ? "Returned"
                : address === currentGame.winner
                ? "Won"
                : "Lost"}
              :{" "}
              {currentGame.winner === "Draw"
                ? currentGame?.stakeAmount
                : Number(currentGame?.stakeAmount)}{" "}
              ETH
            </p>
            <p>
              Contract:{" "}
              <a
                href={`https://sepolia.etherscan.io/address/${currentGame?.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                {currentGame?.contractAddress}
              </a>
            </p>
            <div className="mt-4 text-center text-2xl font-bold">
              {currentGame.winner === "Draw" ? (
                <span className="text-yellow-500">IT'S A TIE!</span>
              ) : address === currentGame.winner ? (
                <span className="text-red-500">YOU WON!</span>
              ) : (
                <span className="text-red-500">
                  YOU WERE DEFEATED by {currentGame.winner}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
