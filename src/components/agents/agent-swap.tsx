"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useBalance, useReadContract, useWriteContract } from "wagmi";
import type { Address } from "viem";
import { formatUnits, parseUnits, maxUint256 } from "viem";
import Link from "next/link";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { publicEnv } from "@/lib/env.public";

import { erc20Abi } from "@/lib/abis/erc20Abi";
import { factoryAbi } from "@/lib/abis/factoryAbi";

import { ExternalLinkIcon } from "lucide-react";

/* --------------------
   Constants
-------------------- */
const ERC20_ABI = erc20Abi;
const AgentFactoryABI = factoryAbi;

const FINAL_USDC_RESERVE = BigInt(11_180_339_887); // Max reserve target (explain in docs!)
const FEE_DIVISOR = BigInt(1_000_000); // Fee precision divisor
const DEFAULT_CURVE_FEE = BigInt(20_000); // 2% fee

const factoryAddress = publicEnv.NEXT_PUBLIC_AGENT_FACTORY as `0x${string}`;
const usdcAddress = publicEnv.NEXT_PUBLIC_USDC_ARBITRUM_ADDRESS as `0x${string}`;

/* --------------------
   Helpers
-------------------- */

// Constant product style curve with fee support
function calcAmountOut(
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint,
    feeBps: bigint = BigInt(200) // default 2%
): bigint {
    if (amountIn <= BigInt(0) || reserveIn <= BigInt(0) || reserveOut <= BigInt(0)) return BigInt(0);
    const numerator = amountIn * reserveOut;
    const denominator = reserveIn + amountIn;
    const rawOut = numerator / denominator;
    return (rawOut * (BigInt(10000) - feeBps)) / BigInt(10000);
}

// Normalize decimal input (comma → dot, remove invalid chars)
function sanitizeDecimalInput(value: string): string {
    return value.replace(",", ".").replace(/[^0-9.]/g, "");
}

type Props = {
    tokenAddress: Address;
};

type AgentInfo = {
    creator: Address;
    purchasedBacktesting: boolean;
    liquidityPositionId: bigint;
};

export default function AgentSwap({ tokenAddress }: Props) {
    const { address, isConnected } = useAccount();
    const { writeContractAsync, isPending } = useWriteContract();
    const queryClient = useQueryClient();

    /* --------------------
       Contract Reads
    -------------------- */
    const { data: usdcDecimals } = useReadContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
    }) as { data: number | undefined };

    const { data: tokenDecimals } = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
    }) as { data: number | undefined };

    const { data: usdcSymbol } = useReadContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "symbol",
    }) as { data: string | undefined };

    const { data: tokenSymbol } = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "symbol",
    }) as { data: string | undefined };

    const {
        data: bondingCurveInfo,
        status: bondingCurveStatus,
        isLoading: bondingCurveLoading
    } = useReadContract({
        address: factoryAddress,
        abi: AgentFactoryABI,
        functionName: "bondingCurveInfo",
        args: [tokenAddress],
        query: { enabled: Boolean(tokenAddress) },
    }) as {
        data: [bigint, bigint] | undefined;
        status: "pending" | "success" | "error";
        isLoading: boolean;
    };

    const { data: agentInformation } = useReadContract({
        address: factoryAddress,
        abi: AgentFactoryABI,
        functionName: "agentInfo",
        args: [tokenAddress],
        query: { enabled: Boolean(tokenAddress) },
    }) as { data: AgentInfo | undefined };

    /* --------------------
       Balances & Allowances
    -------------------- */
    const { data: usdcBal } = useBalance({ address, token: usdcAddress });
    const { data: tokenBal } = useBalance({ address, token: tokenAddress });

    const { data: usdcAllowance } = useReadContract({
        address: usdcAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address && factoryAddress ? [address, factoryAddress] : undefined,
        query: { enabled: Boolean(address && usdcAddress) },
    }) as { data: bigint | undefined };

    const { data: tokenAllowance } = useReadContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "allowance",
        args: address && factoryAddress ? [address, factoryAddress] : undefined,
        query: { enabled: Boolean(address) },
    }) as { data: bigint | undefined };

    /* --------------------
       UI State
    -------------------- */
    const [buyAmount, setBuyAmount] = useState<string>("");
    const [buyMinOut, setBuyMinOut] = useState<string>("0");
    const [sellAmount, setSellAmount] = useState<string>("");
    const [sellMinOut, setSellMinOut] = useState<string>("0");

    /* --------------------
       Derived Values
    -------------------- */
    const parsed = useMemo(() => {
        const reserveUsdc = bondingCurveInfo?.[0] ?? BigInt(0);
        const reserveAgent = bondingCurveInfo?.[1] ?? BigInt(0);

        const reserveUsdcFmt = formatUnits(reserveUsdc, usdcDecimals ?? 6);
        const reserveAgentFmt = formatUnits(reserveAgent, tokenDecimals ?? 18);

        const currentPrice = Number(reserveUsdcFmt) / Number(reserveAgentFmt);
        const currentMarketCap = currentPrice * 1_000_000_000; // hardcoded supply assumption
        const currentBondingPercentage = Math.min((currentMarketCap / 25_000) * 100, 100);
        const currentWidth = `${currentBondingPercentage}%`;

        const uniswapLiquidityPositionId = agentInformation?.liquidityPositionId ?? BigInt(0);

        const buyIn = buyAmount && usdcDecimals !== undefined ? parseUnits(buyAmount, usdcDecimals) : BigInt(0);
        const buyMin = buyIn > BigInt(0) ? calcAmountOut(buyIn, reserveUsdc, reserveAgent) : BigInt(0);

        const sellIn =
            sellAmount && tokenDecimals !== undefined ? parseUnits(sellAmount, tokenDecimals) : BigInt(0);
        const sellMin = sellIn > BigInt(0) ? calcAmountOut(sellIn, reserveAgent, reserveUsdc) : BigInt(0);

        return {
            buyIn,
            buyMin,
            sellIn,
            sellMin,
            reserveUsdcFmt,
            reserveAgentFmt,
            reserveUsdc,
            reserveAgent,
            currentPrice,
            currentMarketCap,
            currentBondingPercentage,
            currentWidth,
            uniswapLiquidityPositionId,
        };
    }, [buyAmount, sellAmount, bondingCurveInfo, agentInformation, usdcDecimals, tokenDecimals]);

    /* --------------------
       Sync formatted outputs
    -------------------- */
    useEffect(() => {
        if (parsed.buyMin > BigInt(0) && tokenDecimals !== undefined) {
            setBuyMinOut(formatUnits(parsed.buyMin, tokenDecimals));
        } else {
            setBuyMinOut("0");
        }
    }, [parsed.buyMin, tokenDecimals]);

    useEffect(() => {
        if (parsed.sellMin > BigInt(0) && usdcDecimals !== undefined) {
            setSellMinOut(formatUnits(parsed.sellMin, usdcDecimals));
        } else {
            setSellMinOut("0");
        }
    }, [parsed.sellMin, usdcDecimals]);

    /* --------------------
       Approvals & Checks
    -------------------- */
    const needUsdcApproval = useMemo(() => {
        if (!usdcAllowance) return parsed.buyIn > BigInt(0);
        return usdcAllowance < parsed.buyIn;
    }, [usdcAllowance, parsed.buyIn]);

    const needTokenApproval = useMemo(() => {
        if (!tokenAllowance) return parsed.sellIn > BigInt(0);
        return tokenAllowance < parsed.sellIn;
    }, [tokenAllowance, parsed.sellIn]);

    async function approve(spender: Address, token: Address) {
        try {
            await writeContractAsync({
                address: token,
                abi: ERC20_ABI,
                functionName: "approve",
                args: [spender, maxUint256],
            });
        } catch (err) {
            console.error("Approval failed:", err);
        }
    }

    /* --------------------
       Buy / Sell Handlers
    -------------------- */
    async function onBuy() {
        try {
            if (!address) throw new Error("Connect Wallet");
            if (!usdcAddress) throw new Error("USDC address not found.");
            if (parsed.buyIn <= BigInt(0)) throw new Error("Enter an amount greater than 0.");

            if (needUsdcApproval) {
                await approve(factoryAddress, usdcAddress);
                queryClient.invalidateQueries();
            }

            let totalIn = parsed.buyIn;
            let totalOut = parsed.buyMin;

            // Prevent overshooting final reserve
            const amountInAfterFees = FINAL_USDC_RESERVE - parsed.reserveUsdc;
            const usdcNeededBeforeFees =
                (amountInAfterFees * FEE_DIVISOR) / (FEE_DIVISOR - DEFAULT_CURVE_FEE);

            if (totalIn > usdcNeededBeforeFees) {
                totalIn = usdcNeededBeforeFees;
                totalOut = BigInt(0);
                setBuyAmount(formatUnits(totalIn, usdcDecimals ?? 6));
            }

            await writeContractAsync({
                address: factoryAddress,
                abi: AgentFactoryABI,
                functionName: "buyAgentToken",
                args: [tokenAddress, totalIn, totalOut],
            });

            setBuyAmount("");
            queryClient.invalidateQueries();
        } catch (err) {
            console.error("Buy failed:", err);
        }
    }

    async function onSell() {
        try {
            if (!address) throw new Error("Connect Wallet");
            if (parsed.sellIn <= BigInt(0)) throw new Error("Enter an amount greater than 0.");

            if (needTokenApproval) {
                await approve(factoryAddress, tokenAddress);
                queryClient.invalidateQueries();
            }

            await writeContractAsync({
                address: factoryAddress,
                abi: AgentFactoryABI,
                functionName: "sellAgentToken",
                args: [tokenAddress, parsed.sellIn, parsed.sellMin],
            });

            setSellAmount("");
            queryClient.invalidateQueries();
        } catch (err) {
            console.error("Sell failed:", err);
        }
    }

    /* --------------------
       Format Balances
    -------------------- */
    const usdcBalanceFmt =
        usdcBal && usdcDecimals !== undefined ? formatUnits(usdcBal.value, usdcDecimals) : "0";
    const tokenBalanceFmt =
        tokenBal && tokenDecimals !== undefined ? formatUnits(tokenBal.value, tokenDecimals) : "0";


    /* --------------------
       Render
    -------------------- */

    if(bondingCurveLoading) return <>Loading...</>;

    return parsed.reserveUsdc !== BigInt(0) ? (
        <>
            {/* Buy/Sell Card */}
            <div className="space-y-4 my-2 border p-4 rounded-md">
                <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="w-1/2 rounded-md">
                        <TabsTrigger value="buy" className="data-[state=active]:!text-teal-500">
                            Buy
                        </TabsTrigger>
                        <TabsTrigger value="sell" className="data-[state=active]:!text-red-400">
                            Sell
                        </TabsTrigger>
                    </TabsList>

                    {/* Buy Tab */}
                    <TabsContent value="buy" className="space-y-3">
                        <div className="grid gap-2">
                            <Label className="text-xs text-neutral-400">
                                You pay ({usdcSymbol ?? "USDC"})
                            </Label>
                            <Input
                                inputMode="decimal"
                                placeholder="0.0"
                                value={buyAmount}
                                onChange={(e) => setBuyAmount(sanitizeDecimalInput(e.target.value))}
                                className="h-10"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs text-neutral-400">
                                You receive ({tokenSymbol ?? "AGENT"})
                            </Label>
                            <Input
                                inputMode="decimal"
                                placeholder="0"
                                value={buyMinOut}
                                readOnly
                                className="h-10"
                            />
                        </div>

                        <Button
                            className="w-full h-10"
                            variant="outline"
                            disabled={isPending || parsed.buyIn <= BigInt(0) || !isConnected}
                            onClick={onBuy}
                        >
                            {needUsdcApproval ? "Approve + Buy" : "Buy"}
                            {isPending && " (Pending)"}
                        </Button>

                        <div className="flex items-center justify-end">
                            <Badge variant="secondary">
                                Balance {usdcSymbol ?? "USDC"}: {Number(usdcBalanceFmt).toLocaleString()}
                            </Badge>
                        </div>
                    </TabsContent>

                    {/* Sell Tab */}
                    <TabsContent value="sell" className="space-y-3">
                        <div className="grid gap-2">
                            <Label className="text-xs text-neutral-400">
                                You pay ({tokenSymbol ?? "AGENT"})
                            </Label>
                            <Input
                                inputMode="decimal"
                                placeholder="0.0"
                                value={sellAmount}
                                onChange={(e) => setSellAmount(sanitizeDecimalInput(e.target.value))}
                                className="h-10"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs text-neutral-400">
                                You receive ({usdcSymbol ?? "USDC"})
                            </Label>
                            <Input
                                inputMode="decimal"
                                placeholder="0"
                                value={sellMinOut}
                                readOnly
                                className="h-10"
                            />
                        </div>

                        <Button
                            className="w-full h-10"
                            variant="outline"
                            disabled={isPending || parsed.sellIn <= BigInt(0) || !isConnected}
                            onClick={onSell}
                        >
                            {needTokenApproval ? "Approve + Sell" : "Sell"}
                            {isPending && " (Pending)"}
                        </Button>

                        <div className="flex items-center justify-end">
                            <Badge variant="secondary">
                                Balance {tokenSymbol ?? "AGENT"}: {Number(tokenBalanceFmt).toLocaleString()}
                            </Badge>
                        </div>
                    </TabsContent>
                </Tabs>

                <Button asChild variant="outline" className="w-full mt-4">
                    <Link
                        href={`https://arbiscan.io/address/${tokenAddress}`}
                        target="_blank"
                        className="text-cyan-300 flex hover:underline underline-offset-4 text-xs justify-center"
                    >
                        View on Arbiscan
                        <ExternalLinkIcon className="size-4 ml-2" />
                    </Link>
                </Button>
            </div>

            {/* Bonding Curve Info */}
            <div className="space-y-4 my-2 border p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400">
                    <span>Current Price:</span>
                    <span className="text-end">
                        {parsed.currentPrice.toFixed(6)} {usdcSymbol ?? "USDC"} / {tokenSymbol ?? "AGENT"}
                    </span>
                    <span>Current Market Cap:</span>
                    <span className="text-end">
                        ${parsed.currentMarketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                    </span>
                    <span>Current Bonding Curve:</span>
                    <span className="text-end">{parsed.currentBondingPercentage.toFixed(2)}%</span>
                    <div className="col-span-2 w-full bg-neutral-800 rounded-full h-2 mt-1">
                        <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: parsed.currentWidth }}
                        ></div>
                    </div>
                    <span>$0</span>
                    <span className="text-end">$25k</span>
                </div>
            </div>
        </>
    ) : (
        // When curve exhausted → Uniswap available
        <div className="space-y-4 my-2 border p-4 rounded-md">
            <Image
                src="/images/agents/bonded.png"
                alt="No Reserve"
                width={400}
                height={200}
                className="mx-auto"
            />
            <div className="text-center text-sm text-neutral-400">
                The bonding curve of {tokenSymbol ?? "AGENT"} has been reached and is now tradeable on
                Uniswap.
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
                <Link
                    href={`https://app.uniswap.org/#/swap?chain=arbitrum&outputCurrency=${tokenAddress}`}
                    target="_blank"
                    className="text-pink-400 flex hover:underline underline-offset-4 text-xs justify-center"
                >
                    Trade on Uniswap
                    <ExternalLinkIcon className="size-4 ml-2" />
                </Link>
            </Button>
        </div>
    );
}
