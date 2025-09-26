"use client";

import React, { useState, useEffect, Suspense } from "react";
import { fetchBalances, UserBalance } from "@/lib/queries/fetchBalances";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Portfolio() {
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  // Fetch balances on mount and every 10 seconds
  useEffect(() => {
    if (!address) return;

    const loadBalances = async () => {
      try {
        const data = await fetchBalances(address);
        setBalances(data);
      } catch (err: any) {
        console.error("Error fetching balances:", err);
        setError(err.message ?? "Failed to fetch balances");
      } finally {
        setError(null);
      }
    };

    loadBalances();
    const interval = setInterval(loadBalances, 60000);
    return () => clearInterval(interval);
  }, [address]);

  if (error) return <div>{error}</div>;

  return (
    <Card className="w-full bg-transparent p-2">
      
      <table className="min-w-full table-auto border-collapse text-xs md:text-sm">
        <thead>
          <tr className="bg-neutral-900 text-left rounded-t-md">
            <th className="p-2 w-20 border-b rounded-tl-md">Ticker</th>
            <th className="p-2 border-b">Name</th>
            <th className="p-2 w-40 border-b">Market Cap</th>
            <th className="p-2 w-12 border-b">ID</th>
            <th className="p-2 w-20 border-b">Price</th>
            <th className="p-2 w-20 border-b">Balance</th>
            <th className="p-2 w-20 border-b  rounded-tr-md">Value</th>
          </tr>
        </thead>
        <tbody className="[&>tr>td]:py-1.5 [&>tr>td]:px-3 [&>tr>td]:truncate">
          {balances.map((balanceItem) => {
            // Format balance
            const raw = BigInt(balanceItem.balance);
            const balanceFmt = Number(formatUnits(raw, 18));
            const formatted = balanceFmt.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            // Format market cap
            const rawMarketCap = BigInt(balanceItem.token.marketCap || "0");
            const marketCapFmt = Number(formatUnits(rawMarketCap, 6));
            const marketCapFormatted = marketCapFmt.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            });

            const reserveUsdc = BigInt(balanceItem.token.reserveUsdc || "0");
            const reserveAgent = BigInt(balanceItem.token.reserveAgent || "0");
            const reserveUsdcFmt = Number(formatUnits(reserveUsdc, 6));
            const reserveAgentFmt = Number(formatUnits(reserveAgent, 18));
            
            let currentPrice = 0;
            let currentValue = 0;
            if (reserveAgentFmt === 0) {
              // Add logic for Uniswap V3 LP tokens or handle zero division
              currentPrice = 0;
              currentValue = 0;
            } else {
              currentPrice = reserveUsdcFmt / reserveAgentFmt;
              currentValue = currentPrice * Number(balanceFmt);
            }

            return (
              <tr key={balanceItem.id} className="hover:bg-neutral-900 border-b last:border-b-0">
                <td>{balanceItem.token.symbol}</td>
                <td className="text-neutral-400">{balanceItem.token.name}</td>
                <td>{marketCapFormatted}</td>
                <td>{balanceItem.token.positionId}</td>
                <td>{Number(currentPrice).toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 7,
                  maximumFractionDigits: 7,
                })}</td>
                <td>{formatted}</td>
                <td className="text-sm">
                  {Number(currentValue).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div className="p-4 animate-pulse">Loading balances…</div>}>
      <Portfolio />
    </Suspense>
  );
}