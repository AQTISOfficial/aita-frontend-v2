"use client";

import { publicEnv } from "@/lib/env.public";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

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
  apr: number; // decimal (e.g. 0.1234 => 12.34%)
  leader: string;
  followers: Follower[];
}

interface HyperliquidVaultsProps {
  vaultAddress: string;
  className?: string;
  details?: boolean;
}

const hyperliquidApiUrl = publicEnv.NEXT_PUBLIC_HYPERLIQUID_API_URL;

export function HyperliquidVaults({ vaultAddress, className, details }: HyperliquidVaultsProps) {
  // Fetch vault details via React Query (Suspense handled by parent)
  const { data: vault } = useQuery<VaultData>({
    queryKey: ["vault", "details", vaultAddress],
    queryFn: async () => {
      const params = { type: "vaultDetails", vaultAddress };
      const res = await fetch(hyperliquidApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        cache: 'no-store'
      });
      if (!res.ok) throw new Error("Failed to fetch vault data");
      const data: VaultData = await res.json();
      if (!data || !data.name) throw new Error("Invalid vault data received");
      return data;
    },
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: true,
  });

  const { totalVaultValue, totalVaultPnl, currentApr, currentPnl } = useMemo(() => {
    if (!vault?.followers?.length) {
      return {
        totalVaultValue: null,
        totalVaultPnl: null,
        currentApr: vault ? Number((vault.apr * 100).toFixed(2)) : null,
        currentPnl: null,
      };
    }
    const totalPnl = vault.followers.reduce((acc: number, follower: Follower) => {
      const raw = follower?.pnl;
      const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace(",", ".")) : 0;
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);
    const totalValueEquity = vault.followers.reduce((acc: number, follower: Follower) => {
      const raw = follower?.vaultEquity;
      const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw.replace(",", ".")) : 0;
      return acc + (Number.isFinite(n) ? n : 0);
    }, 0);

    const formattedTvl = Number(totalValueEquity).toLocaleString("en-US", { style: "currency", currency: "USD" });
    const formattedPnl = Number(totalPnl).toLocaleString("en-US", { style: "currency", currency: "USD" });
    const aprPct = parseFloat((vault.apr * 100).toFixed(2));
    const pnlPct = totalValueEquity > 0 ? parseFloat(((totalPnl / totalValueEquity) * 100).toFixed(2)) : 0;
    return {
      totalVaultValue: formattedTvl,
      totalVaultPnl: formattedPnl,
      currentApr: aprPct,
      currentPnl: pnlPct,
    };
  }, [vault]);

  const router = useRouter();
  if (!vault) return null; // Suspense ensures we have data; guard for types

  return (
    <div className={className}>
      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="font-light text-teal-300 text-xl">
            {vault.name}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={`font-mono text-sm p-2 bg-neutral-800 ${(currentPnl ?? 0) < 0 ? "text-red-500" : "text-teal-500"}`}
            >
              {(currentPnl ?? 0) < 0 ? <IconTrendingDown /> : <IconTrendingUp />}
              {(currentPnl ?? 0) > 0 && "+"} {(currentPnl ?? 0).toFixed(2)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4 min-h-20">{vault.description}</CardDescription>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span>Total Value Locked:</span>
            <span className="text-neutral-300 font-mono text-end">{totalVaultValue ?? "N/A"}</span>
            <span>Unrealized PnL:</span>
            <span className={`flex items-center font-mono justify-end ${Number(currentPnl) < 0 ? "text-red-500" : "text-teal-500"}`}>
              {totalVaultPnl ?? "N/A"}
              {Number(currentPnl) < 0 ? (
                <IconTrendingDown className="size-4 ml-2" />
              ) : (
                <IconTrendingUp className="size-4 ml-2" />
              )}
            </span>
            <span>Current APR:</span>
            <span className={`flex items-center font-mono justify-end ${Number(currentApr) < 0 ? "text-red-500" : "text-teal-500"}`}>
              {currentApr == null ? "N/A" : `${currentApr}%`}
              {(currentApr ?? 0) < 0 ? (
                <IconTrendingDown className="size-4 ml-2" />
              ) : (
                <IconTrendingUp className="size-4 ml-2" />
              )}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-end gap-2 text-sm">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push(`/vaults/${vaultAddress}`)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Per-card skeleton (can be used as Suspense fallback)
export function VaultCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Card className="p-4 rounded-xl border border-neutral-800 animate-pulse flex flex-col gap-4 bg-neutral-950">
        <div className="h-5 w-40 bg-neutral-800 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-neutral-800/80 rounded" />
          <div className="h-3 w-5/6 bg-neutral-800/60 rounded" />
          <div className="h-3 w-2/3 bg-neutral-800/50 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 bg-neutral-800/70 rounded" />
          ))}
        </div>
        <div className="h-8 w-28 bg-neutral-800/80 rounded self-end" />
      </Card>
    </div>
  )
}
