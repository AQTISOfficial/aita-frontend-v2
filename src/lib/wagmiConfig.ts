// wagmiConfig.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import {
  metaMaskWallet,
  rainbowWallet,
  rabbyWallet,
  trustWallet
} from '@rainbow-me/rainbowkit/wallets';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { publicEnv } from '@/lib/env.public';
import { CHAIN, RPC_URLS } from './chains';

const globalForWagmi = globalThis as unknown as {
  wagmiConfig?: ReturnType<typeof getDefaultConfig>;
};

const { wallets } = getDefaultWallets();

export const wagmiConfig =
  globalForWagmi.wagmiConfig ??
  getDefaultConfig({
    appName: 'AITA - AI Trading Agent',
    wallets: [
      {
        groupName: 'Recommended',
        wallets: [rabbyWallet, metaMaskWallet, rainbowWallet, trustWallet],
      },
      ...wallets,
    ],
    projectId: publicEnv.NEXT_PUBLIC_REOWN_ID!,
    chains: [CHAIN.ETHEREUM, CHAIN.ARBITRUM],
    transports: {
      [CHAIN.ETHEREUM.id]: http(RPC_URLS[CHAIN.ETHEREUM.id]),
      [CHAIN.ARBITRUM.id]: http(RPC_URLS[CHAIN.ARBITRUM.id]),
    },
    ssr: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForWagmi.wagmiConfig = wagmiConfig;
}
