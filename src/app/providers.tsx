"use client";

import '@rainbow-me/rainbowkit/styles.css';
import {
  darkTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode } from "react";
import { arbitrum } from 'wagmi/chains';

import { wagmiConfig } from '@/lib/wagmiConfig';

const queryClient = new QueryClient();

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider reconnectOnMount={true} config={wagmiConfig}>
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
