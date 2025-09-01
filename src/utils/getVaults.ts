import { vaults } from "@/lib/vaults";
import {
    publicEnv

} from "@/lib/env.public";
type VaultDetailsResponse = {
    vaultAddress: string;
    tvl: string;
}

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

async function getVaultDetails(vaultAddress: string): Promise<VaultDetailsResponse> {
    const params = { type: "vaultDetails", vaultAddress };
    const res = await fetch(hyperliquidApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`API request failed for vault ${vaultAddress}`);
    return (await res.json()) as VaultDetailsResponse;
}

export async function getCombinedTVL() {
    const details = await Promise.all(
        vaults.map(v => getVaultDetails(v.address))
    );
   
    return {
        totalTVL: details.reduce((sum, d) => sum + parseFloat(d.tvl), 0),
        perVault: details.map(d => ({
            address: d.vaultAddress,
            tvl: parseFloat(d.tvl),
        }))
    };
}
