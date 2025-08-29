// src/lib/vaultTransfer.ts
import type * as hl from "@nktkas/hyperliquid";

export async function depositToVault(
  client: hl.ExchangeClient,
  args: { vaultAddress: `0x${string}`; usd: number; expiresAfterMs?: number } // verplicht
) {
  return client.vaultTransfer({
    vaultAddress: args.vaultAddress,
    isDeposit: true,
    usd: args.usd,
    expiresAfter: Date.now() + (args.expiresAfterMs ?? 60_000),
  });
}

export async function withdrawFromVault(
  client: hl.ExchangeClient,
  args: { vaultAddress: `0x${string}`; usd: number; expiresAfterMs?: number } // verplicht
) {
  return client.vaultTransfer({
    vaultAddress: args.vaultAddress,
    isDeposit: false,
    usd: args.usd,
    expiresAfter: Date.now() + (args.expiresAfterMs ?? 60_000),
  });
}
