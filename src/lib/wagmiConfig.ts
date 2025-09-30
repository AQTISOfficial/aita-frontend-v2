// wagmiConfig.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum } from 'wagmi/chains';
import { http } from 'wagmi';
import {
  metaMaskWallet,
  rainbowWallet,
  rabbyWallet,
  trustWallet
} from '@rainbow-me/rainbowkit/wallets';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { publicEnv } from '@/lib/env.public';

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
    chains: [arbitrum],
    transports: {
      [arbitrum.id]: http(publicEnv.NEXT_PUBLIC_RPC_URL_ARBITRUM!),
    },
    ssr: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForWagmi.wagmiConfig = wagmiConfig;
}
