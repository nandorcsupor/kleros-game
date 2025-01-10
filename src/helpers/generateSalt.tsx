import { ethers } from "ethers";
import { WalletClient } from "viem";

const walletClientToSigner = (walletClient: WalletClient) => {
  const provider = new ethers.providers.Web3Provider(walletClient.transport);
  return provider.getSigner();
};

export const generateKlerosSalt = async (
  gameId: string,
  walletClient: WalletClient
): Promise<string> => {
  const signer = walletClientToSigner(walletClient);
  const message = `RockPaperScissors-Game-${gameId}`;
  const signature = await signer.signMessage(message);
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature));
};
