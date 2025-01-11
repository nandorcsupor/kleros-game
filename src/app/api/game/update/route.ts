import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { CurrentGame, GameState, Move } from "@/types/types";

interface GameData {
  currentGame: CurrentGame | null;
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const updates = await req.json();

    // Get current game from Redis
    const gameData = (await redis.get<GameData>("currentGame")) || {
      currentGame: null,
    };

    const updatedGame: CurrentGame = {
      ...gameData.currentGame,
      ...updates,
      lastAction: Date.now(),
    };

    // Validation checks stay the same
    if (
      updates.gameState &&
      !Object.values(GameState).includes(updates.gameState)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid game state" },
        { status: 400 }
      );
    }

    if (
      updates.player2Move &&
      !Object.values(Move).includes(updates.player2Move)
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid move" },
        { status: 400 }
      );
    }

    // Save to Redis instead of file
    await redis.set("currentGame", {
      currentGame: updatedGame,
    });

    return NextResponse.json({
      success: true,
      game: updatedGame,
    });
  } catch (error) {
    console.error("Error updating game:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update game" },
      { status: 500 }
    );
  }
}
