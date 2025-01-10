"use client";

import { useGame } from "@/context/GameContext";
import { generateKlerosSalt } from "@/helpers/generateSalt";
import { getMoveString } from "@/helpers/getMoveString";
import { RPS_CONTRACT } from "@/lib/contracts/rps";
import { GameState } from "@/types/types";
import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";

export function Player1Waiting() {
  const { currentGame, refreshGame } = useGame();
  const [isFinishing, setIsFinishing] = useState(false);
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const revealAndFinish = async () => {
    setIsFinishing(true);
    try {
      if (!walletClient || !currentGame) {
        console.error("Missing walletClient or currentGame.");
        setIsFinishing(false);
        return;
      }

      const regeneratedSalt = await generateKlerosSalt(
        currentGame.gameId,
        walletClient
      );

      await walletClient.writeContract({
        address: currentGame.contractAddress as `0x${string}`,
        abi: RPS_CONTRACT.abi,
        functionName: "solve",
        args: [currentGame.player1Move, BigInt(regeneratedSalt)],
      });

      let winner: string;
      if (currentGame.player1Move === currentGame.player2Move) {
        winner = "Draw";
      } else if (
        Number(currentGame.player1Move) % 2 ===
        Number(currentGame.player2Move) % 2
          ? Number(currentGame.player1Move) < Number(currentGame.player2Move)
          : Number(currentGame.player1Move) > Number(currentGame.player2Move)
      ) {
        winner = currentGame.player1;
      } else {
        winner = currentGame.player2;
      }

      await fetch("/api/game/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState: GameState.COMPLETED,
          winner: winner,
        }),
      });

      await refreshGame();
    } catch (error) {
      console.error("Error finishing game:", error);
    } finally {
      setIsFinishing(false);
    }
  };

  if (!currentGame)
    return (
      <div>
        <h3 className="text-xl font-bold">No game found</h3>
      </div>
    );

  return (
    <div>
      {currentGame.gameState === GameState.WAITING_FOR_PLAYER2 && (
        <div className="p-6 bg-slate-800 rounded-lg space-y-4">
          <h3 className="text-xl font-bold">Waiting for Player 2</h3>
          <div className="space-y-2">
            <p className="text-sm text-slate-300">Game Info:</p>
            <p>Opponent: {currentGame?.player2}</p>
            <p>Your move: {getMoveString(currentGame?.player1Move)}</p>
            <p>Staked Amount: {currentGame?.stakeAmount} ETH</p>
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
        </div>
      )}

      {currentGame.gameState === GameState.WAITING_FOR_REVEAL && (
        <div className="p-6 bg-slate-800 rounded-lg space-y-4 text-center">
          <h3 className="text-xl font-bold">Reveal Move and Finish Game</h3>
          <div className="space-y-2">
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
          <div className="flex space-x-4 align-center">
            <button
              type="submit"
              disabled={isFinishing}
              onClick={() => revealAndFinish()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isFinishing ? (
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
                  Finishing...
                </>
              ) : (
                "Reveal"
              )}
            </button>
          </div>
        </div>
      )}

      {currentGame.gameState === GameState.COMPLETED && (
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
    </div>
  );
}
