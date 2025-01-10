import { WalletInfo } from "@/components/WalletInfo";
import { CreateGame } from "@/components/CreateGame";
import { GameProvider } from "@/context/GameContext";

export default function Home() {
  return (
    <GameProvider>
      <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-slate-900 text-white">
        <header className="py-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            Rock Paper Scissors Lizard Spock
          </h1>
          <p className="text-slate-400">Web3 Edition</p>
          <WalletInfo />
        </header>

        <main className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            <section className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Game Status</h2>
              <CreateGame />
            </section>
          </div>
        </main>

        <footer className="py-6 text-center text-slate-400">
          <p>Built by Nandor Csupor | Kleros Applicant</p>
        </footer>
      </div>
    </GameProvider>
  );
}
