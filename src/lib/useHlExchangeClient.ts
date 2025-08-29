// src/lib/useHlExchangeClient.ts
"use client";

import * as hl from "@nktkas/hyperliquid";
import { useMemo } from "react";
import { useWalletClient } from "wagmi";
import type { Hex } from "viem";

export function useHlExchangeClient(defaultVaultAddress?: Hex) {
  const { data: wc } = useWalletClient();

  const client = useMemo(() => {
    if (!wc) return undefined;
    return new hl.ExchangeClient({
      wallet: wc,                           
      transport: new hl.HttpTransport(),    
      defaultVaultAddress,
      // signatureChainId is only for user-signed actions: approveAgent, usdSend, withdraw3.
      // signatureChainId: "0xa4b1" as Hex,  // Arbitrum mainnet
    });
  }, [wc, defaultVaultAddress]);

  return client;
}
