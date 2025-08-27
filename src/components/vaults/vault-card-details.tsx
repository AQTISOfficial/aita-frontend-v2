'use client';

// Component: HyperliquidVaults
// ----------------------------
// Purpose: Display summary (and optionally details) for a single Hyperliquid vault.
// Notes:
// - Client Component: fetches vault data from Hyperliquid API on mount (useEffect).
// - Computes aggregated stats from followers (total TVL, PnL, APR).
// - Renders summary in a styled <Card> with conditional colors/icons.
// - If `details` = false → shows "View Details" button that navigates to vault page.

import { publicEnv } from "@/lib/env.public";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardAction,
  CardDescription,
  CardTitle,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { ChartNoAxesCombined, ChartNoAxesCombinedIcon, Info } from "lucide-react";

interface Follower {
  user: string;
  pnl: number | string | null | undefined;
  vaultEquity: number | string | null | undefined;
  allTimePnl: number | string | null | undefined;
  daysFollowing: number;
  vaultEntryTime: number | string | null | undefined;
  lockupUntil: number | string | null | undefined;
}

interface VaultData {
  name: string;
  description: string;
  vaultAddress: string;
  apr: number;
  leader: string;
  followers: Follower[];
}

interface HyperliquidVaultsProps {
  vaultAddress: string;
  className?: string;
}

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

export function VaultCardDetails({ vaultAddress, className }: HyperliquidVaultsProps) {
  const [vault, setVault] = useState<VaultData | null>(null);
  const [totalVaultValue, setTotalVaultValue] = useState<string | null>(null);
  const [totalVaultPnl, setTotalVaultPnl] = useState<string | null>(null);
  const [currentApr, setCurrentApr] = useState<number | null>(null);
  const [currentPnl, setCurrentPnl] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // **local state for toggle**
  const [tab, setTab] = useState<"about" | "performance">("about");

  const router = useRouter();

  useEffect(() => {
    const fetchVaultData = async () => {
      try {
        setLoading(true);
        const params = { type: "vaultDetails", vaultAddress };
        const res = await fetch(hyperliquidApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        if (!res.ok) throw new Error("Failed to fetch vault data");

        const data: VaultData = await res.json();
        if (!data || !data.name) throw new Error("Invalid vault data received");

        setVault(data);

        if (data?.followers) {
          const totalPnl = data.followers.reduce((acc: number, follower) => {
            const raw = follower?.pnl;
            const n =
              typeof raw === "number"
                ? raw
                : typeof raw === "string"
                  ? Number(raw.replace(",", "."))
                  : 0;
            return acc + (Number.isFinite(n) ? n : 0);
          }, 0);

          const totalValueEquity = data.followers.reduce((acc: number, follower) => {
            const raw = follower?.vaultEquity;
            const n =
              typeof raw === "number"
                ? raw
                : typeof raw === "string"
                  ? Number(raw.replace(",", "."))
                  : 0;
            return acc + (Number.isFinite(n) ? n : 0);
          }, 0);

          const formattedTvl = Number(totalValueEquity).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          });

          const formattedPnl = Number(totalPnl).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          });

          const apr = parseFloat((data.apr * 100).toFixed(2));
          const pnl = parseFloat(((totalPnl / totalValueEquity) * 100).toFixed(2));

          setTotalVaultPnl(formattedPnl);
          setTotalVaultValue(formattedTvl);
          setCurrentApr(apr);
          setCurrentPnl(pnl);
        }
      } catch (err) {
        setError((err as Error).message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVaultData();
  }, [vaultAddress]);

  return (
    <>
      {error && <Card className={`text-red-500 p-4 ${className}`}>Error: {error}</Card>}
      {loading && <Card className={`text-gray-500 p-4 ${className}`}>Loading...</Card>}
      {vault && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm md:text-base text-neutral-400 font-light">Total Value Locked</CardTitle>
            </CardHeader>
            <CardContent className={`text-lg md:text-2xl font-mono flex items-center`}>
              {totalVaultValue ?? "N/A"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm md:text-base text-neutral-400 font-light">Current APR</CardTitle>
            </CardHeader>
            <CardContent className={`text-lg md:text-2xl font-mono flex items-center ${(currentApr ?? 0) < 0 ? "text-red-500" : "text-teal-500"}`}>
              {(currentApr ?? 0) > 0 && "+"} {(currentApr ?? 0).toFixed(2)}% {(currentApr ?? 0) < 0 ? <IconTrendingDown className="size-4 ml-2" /> : <IconTrendingUp className="size-4 ml-2" />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm md:text-base text-neutral-400 font-light">Unrealized PnL</CardTitle>
            </CardHeader>
            <CardContent className={`text-lg md:text-2xl font-mono flex items-center ${(Number(totalVaultPnl) ?? 0) < 0 ? "text-red-500" : "text-teal-500"}`}>
              {totalVaultPnl ?? "N/A"}
              {Number(totalVaultPnl) < 0 ? (
                <IconTrendingDown className="size-4 ml-2" />
              ) : (
                <IconTrendingUp className="size-4 ml-2" />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm md:text-base text-neutral-400 font-light">Current PnL</CardTitle>
            </CardHeader>
            <CardContent className={`text-lg md:text-2xl font-mono flex items-center ${(currentPnl ?? 0) < 0 ? "text-red-500" : "text-teal-500"}`}>
              {(currentPnl ?? 0) > 0 && "+"} {(currentPnl ?? 0).toFixed(2)}% {(currentPnl ?? 0) < 0 ? <IconTrendingDown className="size-4 ml-2" /> : <IconTrendingUp className="size-4 ml-2" />}
            </CardContent>
          </Card>

          <div className={className}>

            <ToggleGroup
              type="single"
              value={tab}
              onValueChange={(v) => v && setTab(v as "about" | "performance")}
              className="gap-1 bg-neutral-900 border w-full mb-4"
            >
              <ToggleGroupItem value="about" aria-label="about" className="px-4 flex-none text-xs"><Info className="size-4 mr-1" />About</ToggleGroupItem>
              <ToggleGroupItem value="performance" aria-label="performance" className="px-4 flex-none items-center text-xs"><ChartNoAxesCombinedIcon className="size-4 mr-1" />Performance</ToggleGroupItem>
            </ToggleGroup>

            {tab === "about" && (
              <Card className={`flex flex-col justify-between`}>
                <CardHeader>

                  <CardDescription className="py-2">{vault.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <table className="text-xs w-60 table-auto border-separate border-spacing--1 font-mono">
                    <tbody>
                    <tr>
                      <td>Leader:</td>
                      <td className="text-neutral-300 text-end">
                        {vault.leader ? `${vault.leader.slice(0, 6)}...${vault.leader.slice(-4)}` : "N/A"}
                      </td>
                    </tr>
                     <tr>
                      <td>Vault Address:</td>
                      <td className="text-neutral-300 text-end">
                        {vault.vaultAddress ? `${vault.vaultAddress.slice(0, 6)}...${vault.vaultAddress.slice(-4)}` : "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <td>Followers:</td>
                      <td className="text-neutral-300 text-end">
                        {vault.followers.length}
                      </td>
                    </tr>
                   </tbody>
                  </table>
                </CardContent>
                <CardFooter className="flex-col items-end gap-2 text-sm">
                </CardFooter>
              </Card>

            )}

            {tab === "performance" && (
              <Card className="h-60 flex flex-col justify-center items-center">
                <p className="text-neutral-400">Performance chart or stats coming here…</p>
              </Card>
            )}
          </div>
        </>
      )}
    </>
  );
}
