"use client";

import { RPS_CONTRACT } from "@/lib/contracts/rps";
import { ethers } from "ethers";
import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Player2Step } from "./Player2Step";
import { CurrentGame, GameState, Move } from "@/types/types";
import { useGame } from "@/context/GameContext";
import { Player1Waiting } from "./Player1Waiting";
import { TimeoutTimer } from "./TimeOutTimer";
import { generateKlerosSalt } from "@/helpers/generateSalt";

interface GameFormData {
  opponentAddress: string;
  stakeAmount: string;
  selectedMove: Move;
}

export function CreateGame() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<GameFormData>({
    opponentAddress: "",
    stakeAmount: "",
    selectedMove: Move.Rock,
  });
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const { currentGame, isPlayer1, isPlayer2, refreshGame } = useGame();
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      if (walletClient !== undefined && publicClient !== undefined && address) {
        // 1. Generate Kleros-style salt using the wallet as signer
        const tempGameId = ethers.utils.id(`${address}-${Date.now()}`);
        const salt = await generateKlerosSalt(tempGameId, walletClient);

        // Create move hash using the generated salt
        const moveHash = ethers.utils.solidityKeccak256(
          ["uint8", "uint256"],
          [formData.selectedMove, salt]
        ) as `0x${string}`;

        // 2. Deploy using user's wallet
        const hash = await walletClient.deployContract({
          abi: RPS_CONTRACT.abi,
          bytecode: RPS_CONTRACT.bytecode,
          args: [moveHash, formData.opponentAddress as `0x${string}`],
          value: parseEther(formData.stakeAmount),
        });

        // 3. Wait for deployment
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (!receipt.contractAddress) {
          throw new Error("No contract address received");
        }

        const currentGame: CurrentGame = {
          contractAddress: receipt.contractAddress,
          player1: address,
          player2: formData.opponentAddress,
          createdAt: Date.now(),
          stakeAmount: formData.stakeAmount,
          gameState: GameState.WAITING_FOR_PLAYER2,
          lastAction: Date.now(),
          player1Move: formData.selectedMove,
          gameId: tempGameId,
        };

        // Save to API
        await fetch("/api/game", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentGame),
        });
        setShowForm(false);
        refreshGame();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Case 1: No wallet connected */}
      {!address ? (
        <p className="text-slate-300">Please connect your wallet to play.</p>
      ) : (
        <>
          {/* Case 2: Active game exists */}
          {currentGame ? (
            <>
              {/* Player 1 View */}
              {isPlayer1 && <Player1Waiting />}

              {/* Player 2 View */}
              {isPlayer2 && <Player2Step />}

              {/* Spectator View */}
              {!isPlayer1 && !isPlayer2 && (
                <p className="text-slate-300">
                  A game is in progress. Please wait for it to finish.
                </p>
              )}

              {/* Show timeout timer for all views if lastAction exists */}
              {currentGame.lastAction && <TimeoutTimer />}
            </>
          ) : (
            // Case 3: No active game - Show create game option
            <>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Start New Game
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Opponent's Address
                    </label>
                    <input
                      type="text"
                      value={formData.opponentAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          opponentAddress: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white"
                      placeholder="0x..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stake Amount (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={formData.stakeAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stakeAmount: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white"
                      placeholder="0.1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Choose Your Move
                    </label>
                    <select
                      value={formData.selectedMove}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selectedMove: Number(e.target.value) as Move,
                        })
                      }
                      className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white"
                      required
                    >
                      <option value={Move.Rock}>Rock</option>
                      <option value={Move.Paper}>Paper</option>
                      <option value={Move.Scissors}>Scissors</option>
                      <option value={Move.Spock}>Spock</option>
                      <option value={Move.Lizard}>Lizard</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
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
                          Creating...
                        </>
                      ) : (
                        "Create Game"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      disabled={isCreating}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
