## Getting Started

First, run the development server:

npm run dev

# or

yarn dev

# Rock Paper Scissors Lizard Spock - Web3 Game

## Game Flow

### Initial State

- Connect Wallet button (MetaMask integration)
- Once connected, shows your ETH balance
- "Start New Game" button

### Creating a Game (Player 1)

1. Click "Start New Game"
2. Input form appears:
   - Opponent's Address (ETH address)
   - Stake Amount (in ETH)
   - Choose Move (Rock/Paper/Scissors/Lizard/Spock)
3. Submit -> MetaMask transaction:
   - Deploys contract
   - Stakes ETH
   - Stores move with salt (security feature)
4. Shows "Waiting for Player 2" screen with:
   - Game contract address
   - Stake amount
   - Copy button for sharing

### Joining a Game (Player 2)

1. Player needs the contract address
2. Input:
   - Choose Move
   - Submit with equal stake amount
3. MetaMask transaction to join

### Game Resolution

1. Player 1 gets notified that Player 2 joined
2. Player 1 needs to reveal their move
3. Contract determines winner
4. ETH gets distributed automatically

### Timeout Scenarios

- If Player 2 doesn't join: Player 1 can reclaim ETH after timeout
- If Player 1 doesn't reveal: Player 2 can claim all ETH after timeout

## Components Structure
