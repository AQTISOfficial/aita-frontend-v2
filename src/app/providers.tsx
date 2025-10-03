"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { mainnet, arbitrum, arbitrumSepolia } from "wagmi/chains";
import { wagmiConfig } from "@/lib/wagmiConfig";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            initialChain={arbitrumSepolia}
            modalSize="compact"
            theme={darkTheme({
              accentColor: "#67AB94",
              accentColorForeground: "white",
              borderRadius: "large",
              fontStack: "system",
              overlayBlur: "small",
            })}
          >
            {children}
          </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
