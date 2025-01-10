import { CurrentGame } from "@/types/types";
import { writeFile, readFile } from "fs/promises";
import { NextResponse } from "next/server";

const DB_PATH = "src/db/game.json";

export async function GET() {
  const data = await readFile(DB_PATH, "utf-8");
  return NextResponse.json(JSON.parse(data));
}

export async function POST(req: Request) {
  const game: CurrentGame = await req.json();
  await writeFile(DB_PATH, JSON.stringify({ currentGame: game }));
  return NextResponse.json({ success: true });
}
