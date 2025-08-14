'use client';

import { publicEnv } from "@/lib/env.public";
import React, { useEffect, useState } from "react";

import { VaultChart } from "./vault-chart";

import { Card, CardContent, CardAction, CardDescription, CardTitle, CardHeader, CardFooter } from "@/components/ui/card";

interface VaultData {
  name: string;
  description: string;
  vaultAddress: string;
  apr: string;
  leader: string;
  followers: any[];
  portfolio: any[];
}

interface HyperliquidVaultsProps {
  vaultAddress: string
  user: string
}

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

export function HyperliquidVaults({ vaultAddress, user }: HyperliquidVaultsProps) {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [totalVaultValue, setTotalVaultValue] = useState<number | null>(null);
  const [totalVaultPnl, setTotalVaultPnl] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        const params = {
          type: "vaultDetails",
          vaultAddress,
        };

        const res = await fetch(hyperliquidApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error("Failed to fetch vault data");
        const data: VaultData = await res.json();
        if (!data || !data.name) throw new Error("Invalid vault data received");


        console.log("Portfolio data:", data.portfolio);
        console.log("Vault data:", data);

        setVault(data);

        if (data?.followers) {
          console.log("Followers:", data.followers);

          type Follower = {
            pnl: number | string | null | undefined
            vaultEquity: number | string | null | undefined
          }

          const totalPnl = data.followers.reduce((acc: number, follower: Follower) => {
            const raw = follower?.pnl
            const n =
              typeof raw === 'number'
                ? raw
                : typeof raw === 'string'
                  ? Number(raw.replace(',', '.'))
                  : 0

            return acc + (Number.isFinite(n) ? n : 0)
          }, 0)

          const totalPnlFormatted = new Intl.NumberFormat('en-EN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(totalPnl)

          const totalValueEquity = data.followers.reduce((acc: number, follower: Follower) => {
            const raw = follower?.vaultEquity
            const n =
              typeof raw === 'number'
                ? raw
                : typeof raw === 'string'
                  ? Number(raw.replace(',', '.'))
                  : 0

            return acc + (Number.isFinite(n) ? n : 0)
          }, 0)

          const totalValueEquityFormatted = new Intl.NumberFormat('en-EN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(totalValueEquity);

          console.log("Total PnL (formatted):", totalPnlFormatted);


          setTotalVaultPnl(totalPnl);
          setTotalVaultValue(totalValueEquity);
          console.log("Total Vault Value (formatted):", totalValueEquityFormatted);
          for (const follower of data.followers) {
            console.log("Follower:", follower);
          }
        }

      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      }
    };

    fetchVaultData();
  }, []);



  return (
    <div className="container px-2">


      {error && <p className="text-red-500">Error: {error}</p>}

      {vault && (
        <>
          <Card className="my-4">
            <CardHeader>
              <CardTitle>{vault.name}</CardTitle>
              <CardDescription>{vault.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Address: {vault.vaultAddress}</p>
              <p>APR: {vault.apr}%</p>
              <p>Leader: {vault.leader}</p>
              <p>Followers: {vault.followers.length}</p>


            </CardContent>
            <CardFooter>
              <p>Total Vault Value: {totalVaultValue}</p>
              <p>Total Vault PnL: {totalVaultPnl}</p>
            </CardFooter>
          </Card>

          <VaultChart data={vault.portfolio} defaultTimeframe="week" defaultSeries="accountValueHistory" />
        </>
      )}
    </div>
  );
}
