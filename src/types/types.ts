export enum GameState {
  UNINITIALIZED = "UNINITIALIZED",
  WAITING_FOR_PLAYER2 = "WAITING_FOR_PLAYER2",
  WAITING_FOR_REVEAL = "WAITING_FOR_REVEAL",
  COMPLETED = "COMPLETED",
  TIMEOUT = "TIMEOUT",
}

export interface CurrentGame {
  contractAddress: string;
  player1: string;
  player2: string;
  createdAt: number;
  stakeAmount: string;
  gameState: GameState;
  lastAction: number;
  winner?: string;
  player1Move: Move;
  player2Move?: Move;
  gameId: string;
}

export enum Move {
  Rock = 1,
  Paper = 2,
  Scissors = 3,
  Spock = 4,
  Lizard = 5,
}
