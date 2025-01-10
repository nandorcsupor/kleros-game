import { useGame } from "@/context/GameContext";
import { RPS_CONTRACT } from "@/lib/contracts/rps";
import { GameState } from "@/types/types";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";

const TIMEOUT_DURATION_MS = 5 * 60 * 1000;

export function TimeoutTimer() {
  const { isPlayer1, isPlayer2, currentGame, refreshGame } = useGame();
  const [isClaiming, setIsClaiming] = useState(false);

  if (currentGame === null) return;
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, currentGame.lastAction + TIMEOUT_DURATION_MS - Date.now())
  );

  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (currentGame.gameState === GameState.COMPLETED) return;

    const interval = setInterval(() => {
      const remainingTime = Math.max(
        0,
        currentGame.lastAction + TIMEOUT_DURATION_MS - Date.now()
      );
      setTimeLeft(remainingTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentGame.lastAction, currentGame.gameState]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const updateDbWithWinner = async (winner: string) => {
    try {
      await fetch("/api/game/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameState: GameState.TIMEOUT,
          winner: winner,
        }),
      });
    } catch (error) {
      console.error("Error updating game with winner:", error);
    }
  };

  const handleJ2Timeout = async () => {
    if (!walletClient) return;
    setIsClaiming(true);

    try {
      if (
        currentGame.gameState === GameState.WAITING_FOR_PLAYER2 &&
        isPlayer1
      ) {
        await walletClient.writeContract({
          address: currentGame.contractAddress as `0x${string}`,
          abi: RPS_CONTRACT.abi,
          functionName: "j2Timeout",
        });

        await updateDbWithWinner(currentGame.player1);
        await refreshGame();
      }
    } catch (error) {
      console.error("Error calling j2Timeout:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleJ1Timeout = async () => {
    if (!walletClient) return;
    setIsClaiming(true);

    try {
      if (currentGame.gameState === GameState.WAITING_FOR_REVEAL && isPlayer2) {
        await walletClient.writeContract({
          address: currentGame.contractAddress as `0x${string}`,
          abi: RPS_CONTRACT.abi,
          functionName: "j1Timeout",
        });

        await updateDbWithWinner(currentGame.player1);
        await refreshGame();
      }
    } catch (error) {
      console.error("Error calling j1Timeout:", error);
    } finally {
      setIsClaiming(false);
    }
  };

  if (currentGame.gameState === GameState.TIMEOUT)
    return (
      <>
        {isPlayer1 ? (
          currentGame.winner === currentGame.player1 ? (
            <p>
              Player 2 timed out - You took back your staked amount:{" "}
              {currentGame.stakeAmount}
            </p>
          ) : (
            <p>
              You timed out, you lost your staked amount:{" "}
              {currentGame.stakeAmount}
            </p>
          )
        ) : currentGame.winner === currentGame.player2 ? (
          <p>
            Player 1 timed out - You took back your staked amount:{" "}
            {currentGame.stakeAmount}
          </p>
        ) : (
          <p>
            You timed out, you lost your staked amount:{" "}
            {currentGame.stakeAmount}
          </p>
        )}
      </>
    );

  return (
    <div>
      {timeLeft > 0 ? (
        <p>
          Time left: {minutes}:{seconds.toString().padStart(2, "0")}
        </p>
      ) : (
        <>
          <div className="flex flex-col items-center mt-10">
            {isPlayer1 &&
            currentGame?.gameState === GameState.WAITING_FOR_PLAYER2 ? (
              <>
                <p>Player 2 Timeout!</p>
                <button
                  type="button"
                  onClick={() => handleJ2Timeout()}
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded mt-2"
                  disabled={isClaiming}
                >
                  Claim Staked Amount
                </button>
              </>
            ) : isPlayer1 ? (
              <p className="text-yellow-400">
                REVEAL OR YOU MIGHT BE TIMED OUT
              </p>
            ) : isPlayer2 &&
              currentGame?.gameState === GameState.WAITING_FOR_PLAYER2 ? (
              <p className="text-yellow-400">STAKE OR YOU MIGHT BE TIMED OUT</p>
            ) : isPlayer2 ? (
              <>
                <p>Player 1 Timeout!</p>
                <button
                  type="button"
                  onClick={() => handleJ1Timeout()}
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded mt-2"
                  disabled={isClaiming}
                >
                  Claim Staked Amount
                </button>
              </>
            ) : (
              <p className="text-slate-300">No actions available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
