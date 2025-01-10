"use client";

import { ConnectKitButton } from "connectkit";
import { useAccount, useBalance } from "wagmi";

export function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    query: {
      refetchInterval: 2000,
    },
  });

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <ConnectKitButton />
      {isConnected && balance && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Your Balance:</p>
          <p className="font-mono">
            {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
          </p>
        </div>
      )}
    </div>
  );
}
