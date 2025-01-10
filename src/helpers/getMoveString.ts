import { Move } from "@/types/types";

export const getMoveString = (move: Move): string => {
  return Move[move];
};
