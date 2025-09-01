// src/components/vaults/vault-actions.tsx
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import type { Hex } from "viem";
import { useHlExchangeClient } from "@/lib/useHlExchangeClient";
import { depositToVault, withdrawFromVault } from "@/lib/vaultTransfer";

export function VaultActions({ vaultAddress }: { vaultAddress: Hex }) {
    const { address } = useAccount();                // voor UI en validatie
    const client = useHlExchangeClient(vaultAddress);

    const [amount, setAmount] = useState("100");
    const [loading, setLoading] = useState<"dep" | "wd" | null>(null);
    const [msg, setMsg] = useState<string | null>(null);



    async function onDeposit() {
       if (!client) return setMsg("Connect wallet");

        try {
            const value = parseFloat(amount); // parse naar number
            if (isNaN(value) || value <= 0) {
                setMsg("Enter a valid amount");
                return;
            }
            setLoading("dep");
            const res = await depositToVault(client, { vaultAddress, usd: value });

            setMsg(`Deposit transaction id: ${res ?? "ok"}`);
        } catch (e: unknown) {
            setMsg((e as Error)?.message ?? "Deposit failed");
        } finally {
            setLoading(null);
        }
    }

    async function onWithdraw() {
         if (!client) return setMsg("Connect wallet");
        try {
            const value = parseFloat(amount); // parse naar number
            if (isNaN(value) || value <= 0) {
                setMsg("Enter a valid amount");
                return;
            }

            setLoading("wd");
            const res = await withdrawFromVault(client, { vaultAddress, usd: value });
            setMsg(`Withdraw transaction id: ${res ?? "ok"}`);
        } catch (e: unknown) {
            setMsg((e as Error)?.message ?? "Withdraw failed");
        } finally {
            setLoading(null);
        }
    }

    return (
        <div className="space-y-3">
            <div>Ingelogd als {address}</div>
            <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border rounded px-2 py-1"
                placeholder="USDC amount"
            />
            <div className="flex gap-2">
                <button disabled={!!loading} onClick={onDeposit} className="px-3 py-1 border rounded">
                    {loading === "dep" ? "Pending..." : "Deposit"}
                </button>
                <button disabled={!!loading} onClick={onWithdraw} className="px-3 py-1 border rounded">
                    {loading === "wd" ? "Pending..." : "Withdraw"}
                </button>
            </div>
            {msg && <p>{msg}</p>}
        </div>
    );
}
