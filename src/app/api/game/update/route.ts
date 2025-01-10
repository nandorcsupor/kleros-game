import { readFile, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { CurrentGame, GameState, Move } from "@/types/types";

const DB_PATH = "src/db/game.json";

export async function POST(req: Request) {
  try {
    const updates = await req.json();

    const currentData = await readFile(DB_PATH, "utf-8");
    const gameData = JSON.parse(currentData);

    const updatedGame: CurrentGame = {
      ...gameData.currentGame,
      ...updates,
      lastAction: Date.now(),
    };

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

    await writeFile(
      DB_PATH,
      JSON.stringify(
        {
          currentGame: updatedGame,
        },
        null,
        2
      )
    );

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
