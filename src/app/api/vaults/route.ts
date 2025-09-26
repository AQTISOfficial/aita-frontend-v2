import { NextResponse } from "next/server";
import { vaults } from "@/lib/vaults";
import { publicEnv } from "@/lib/env.public";
const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

type VaultPortfolioEntry = [
  string,
  {
    accountValueHistory: [number, string][];
  }
];  

type VaultDetailsResponse = {
  name: string;
  vaultAddress: string;
  portfolio: VaultPortfolioEntry[];
};

async function getVaultTVL(vaultAddress: string): Promise<number> {
  const res = await fetch(hyperliquidApiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "vaultDetails",
      vaultAddress
    })
  });

  if (!res.ok) {
    console.error("Vault fetch failed:", vaultAddress, res.status);
    return 0;
  }

  const data = (await res.json()) as VaultDetailsResponse;

  const allTime = data.portfolio.find(([period]) => period === "allTime");
  if (!allTime) return 0;

  const history = allTime[1].accountValueHistory;
  if (!history?.length) return 0;

  const latest = history[history.length - 1][1];
  return parseFloat(latest);
}

export async function GET() {
  try {
    const tvls = await Promise.all(vaults.map(v => getVaultTVL(v.address)));

    const perVault = vaults.map((v, i) => ({
      name: v.name,
      address: v.address,
      tvl: tvls[i]
    }));

    const totalTVL = tvls.reduce((sum, val) => sum + val, 0);

    return NextResponse.json({
      totalTVL,
      perVault
    });
  } catch (e) {
    console.error("Error fetching combined TVL:", e);
    return NextResponse.json(
      { error: "Failed to fetch vault data" },
      { status: 500 }
    );
  }
}
