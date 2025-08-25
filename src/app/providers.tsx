"use client";

// Providers Component
// -------------------
// Purpose: Global wrapper for Wagmi, RainbowKit, and React Query.
// Notes:
// - Must be a Client Component: depends on wagmi hooks and RainbowKit context.
// - Configures supported chains, transports, and wallets via RainbowKit.
// - Provides React Query for API state management across the app.
// - Theme + modal settings for RainbowKit are customized here.

import '@rainbow-me/rainbowkit/styles.css';
import {
    darkTheme,
    getDefaultConfig,
    RainbowKitProvider,
    getDefaultWallets
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, http } from 'wagmi';
import { arbitrum, arbitrumSepolia } from 'wagmi/chains';

import {
    metaMaskWallet,
    rainbowWallet,
    rabbyWallet,
    trustWallet
} from '@rainbow-me/rainbowkit/wallets';

import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { ReactNode } from "react";
import { publicEnv } from '@/lib/env.public';

// Get default wallet groups from RainbowKit
const { wallets } = getDefaultWallets();

// Wagmi + RainbowKit configuration
const config = getDefaultConfig({
    appName: 'AITA - AI Trading Agent',
    wallets: [
        {
            groupName: 'Recommended',
            wallets: [rabbyWallet, metaMaskWallet, rainbowWallet, trustWallet],
        },
        ...wallets,
    ],
    projectId: publicEnv.NEXT_PUBLIC_REOWN_ID!,
    chains: [arbitrum, arbitrumSepolia],
    transports: {
        [arbitrum.id]: http(publicEnv.NEXT_PUBLIC_RPC_URL_ARBITRUM!),
        [arbitrumSepolia.id]: http(publicEnv.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA!),
    },
    ssr: true, // SSR support for Next.js App Router
});

// React Query client (used app-wide for data fetching/caching)
const queryClient = new QueryClient();

interface ProvidersProps {
    children: ReactNode;
}

// Global Providers wrapper
export default function Providers({ children }: ProvidersProps) {
    return (
        <WagmiProvider reconnectOnMount={true} config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    initialChain={arbitrum}
                    modalSize="compact"
                    theme={darkTheme({
                        accentColor: '#67AB94',
                        accentColorForeground: 'white',
                        borderRadius: 'large',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
