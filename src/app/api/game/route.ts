import { CurrentGame } from "@/types/types";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  const data = await redis.get("currentGame");
  return NextResponse.json(data || {});
}

export async function POST(req: Request) {
  const game: CurrentGame = await req.json();
  await redis.set("currentGame", { currentGame: game });
  return NextResponse.json({ success: true });
}
