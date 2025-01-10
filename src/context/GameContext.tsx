"use client";

import { CurrentGame, GameState } from "@/types/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAccount } from "wagmi";

interface GameContextType {
  currentGame: CurrentGame | null;
  isPlayer1: boolean;
  isPlayer2: boolean;
  refreshGame: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentGame, setCurrentGame] = useState<CurrentGame | null>(null);
  const [isPlayer1, setIsPlayer1] = useState(false);
  const [isPlayer2, setIsPlayer2] = useState(false);
  const { address } = useAccount() || {};

  const checkCurrentGame = useCallback(async () => {
    if (!address) return;

    try {
      const response = await fetch("/api/game");
      const data = await response.json();

      if (data.currentGame) {
        setCurrentGame(data.currentGame);
        setIsPlayer1(
          data.currentGame.player1.toLowerCase() === address.toLowerCase()
        );
        setIsPlayer2(
          data.currentGame.player2.toLowerCase() === address.toLowerCase()
        );
      } else {
        setCurrentGame(null);
        setIsPlayer1(false);
        setIsPlayer2(false);
      }
    } catch (error) {
      console.error("Error fetching game:", error);
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;
    checkCurrentGame();
  }, [address]);

  useEffect(() => {
    if (!address) return;
    const interval = setInterval(() => {
      checkCurrentGame();
    }, 1000);

    return () => clearInterval(interval);
  }, [address]);

  useEffect(() => {
    if (
      currentGame?.gameState !== GameState.COMPLETED &&
      currentGame?.gameState !== GameState.TIMEOUT
    )
      return;

    let timeOutTime = 30000;
    if (currentGame?.gameState === GameState.TIMEOUT) {
      timeOutTime = 0;
    }

    const timer = setTimeout(() => {
      fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(null),
      }).then(() => checkCurrentGame());
    }, timeOutTime);

    return () => clearTimeout(timer);
  }, [currentGame?.gameState, checkCurrentGame]);

  return (
    <GameContext.Provider
      value={{
        currentGame,
        isPlayer1,
        isPlayer2,
        refreshGame: checkCurrentGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
