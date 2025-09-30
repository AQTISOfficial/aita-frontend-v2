"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ShieldCheck, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { publicEnv } from '@/lib/env.public'

type MockPosition = {
	id: string
	stakedAt: Date
	unlocksAt: Date
	amount: number
	unclaimed: number
	token: string
}

export default function StakingPage() {
  const tokenSymbol = 'AITA'
  const [amount, setAmount] = useState('')
  const walletBalance = 0
  const totalStaked = 1029910 
  const positions: MockPosition[] = [
    {
      id: 'pos-1',
      stakedAt: new Date('2025-06-20T12:55:53Z'),
      unlocksAt: new Date('2025-07-20T12:55:53Z'),
      amount: 1_000_000,
      unclaimed: 450.75,
      token: tokenSymbol,
    },
    {
      id: 'pos-2',
      stakedAt: new Date('2025-05-14T14:13:51Z'),
      unlocksAt: new Date('2025-06-13T14:13:51Z'),
      amount: 29_910,
      unclaimed: 12.30,
      token: tokenSymbol,
    },
  ]

  const MIN_LOCK_DAYS = 30
  const TOTAL_LOCK_DAYS = 180
  const WITHDRAW_PENALTY = 0.10

  const handleStake = (e: React.FormEvent) => {
    e.preventDefault()
  }

	const fmt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
	const fmtAbbrev = (n: number) => {
		if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
		if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
		if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
		return String(n)
	}
  const fmtDate = (d: Date) => d.toLocaleDateString('en-GB') + ', ' + d.toLocaleTimeString('en-GB', { hour12: false })

  const subgraph = publicEnv.NEXT_PUBLIC_AITA_SUBGRAPH

	return (
		<div className="@container/main flex flex-1 flex-col gap-2">
			{/* Top Coming Soon Banner */}
			<header className="flex flex-col md:flex-row md:items-center md:justify-between px-2 gap-3 md:gap-4 mb-2 lg:mb-4">
				<div className="space-y-2">
					<h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 sm:gap-3">
						Staking
						
					</h1>
					<p className="text-sm text-neutral-400 max-w-prose">
						Earn yield and secure the network by staking your AITA. 
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="text-xs border-amber-500/40 text-amber-300 bg-amber-500/5">Launching Q4 2025</Badge>
				</div>
			</header>

			{/* Stake + Wallet Info */}
			<section className="grid gap-4 md:grid-cols-2 px-2">
				<Card className="border-neutral-800 overflow-hidden">
					<CardHeader>
						<CardTitle className="text-base">Stake your {tokenSymbol}</CardTitle>
						<CardDescription className="text-xs">Interface preview – disabled until launch</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleStake} className="space-y-3">
							<Input
								placeholder="Enter amount"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								inputMode="decimal"
								disabled
							/>
							<Button type="submit" className="w-full" disabled>Stake</Button>
						</form>
					</CardContent>
				</Card>
				<Card className="border-neutral-800 overflow-hidden">
					<CardHeader>
						<CardTitle className="text-base">Your {tokenSymbol} Wallet</CardTitle>
						<CardDescription className="text-xs">Preview balances (mock)</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm font-mono">
						<div className="space-y-1">
							<div className="text-neutral-400">Balance:</div>
							<div>{walletBalance} {tokenSymbol}</div>
						</div>
						<div className="space-y-1">
							<div className="text-neutral-400">Staked:</div>
							<div>
								<span className="inline md:hidden">{fmtAbbrev(totalStaked)} {tokenSymbol}</span>
								<span className="hidden md:inline">{fmt(totalStaked)} {tokenSymbol}</span>
							</div>
						</div>
					</CardContent>
					{/* {Boolean(subgraph) && (
						<CardFooter className="text-[10px] text-neutral-500 truncate">
							Data source (subgraph): {subgraph}
						</CardFooter>
					)} */}
				</Card>
			</section>

			{/* Positions */}
			<section className="space-y-2 mt-2 px-2">
				<Card className="border-neutral-800">
					<CardHeader>
						<CardTitle className="text-base">My Positions</CardTitle>
						<CardDescription className="text-xs">All staking lots (mock data)</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-4 sm:grid-cols-2">
						{positions.map(p => (
							<Card key={p.id} className="border-neutral-800 bg-neutral-900/40 transition-colors hover:border-neutral-700">
								<CardContent className="pt-4 space-y-3 text-[11px] sm:text-xs">
									<div className="grid grid-cols-2 gap-y-1">
										<span className="text-neutral-500">Staked On:</span>
										<span className="text-end font-mono">{fmtDate(p.stakedAt)}</span>
										<span className="text-neutral-500">Unlocks:</span>
										<span className="text-end font-mono">{fmtDate(p.unlocksAt)}</span>
										<span className="text-neutral-500">Staked:</span>
										<span className="text-end font-mono">
											<span className="inline md:hidden">{fmtAbbrev(p.amount)} {p.token}</span>
											<span className="hidden md:inline">{fmt(p.amount)} {p.token}</span>
										</span>
										<span className="text-neutral-500">Unclaimed:</span>
										<span className="text-end font-mono">{p.unclaimed.toFixed(2)} USDC</span>
									</div>
									<div className="flex gap-2 justify-end pt-2">
										<Button size="sm" variant="secondary" disabled>Claim</Button>
										<Button size="sm" variant="outline" disabled>Unstake</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</CardContent>
					<CardFooter className="flex flex-wrap justify-between text-[10px] text-neutral-500 gap-4">
						<span>Min. lock period: {MIN_LOCK_DAYS} days</span>
						<span>Total lock period: {TOTAL_LOCK_DAYS} days</span>
						<span>Withdraw penalty: {WITHDRAW_PENALTY * 100}% (before {TOTAL_LOCK_DAYS} days)</span>
					</CardFooter>
				</Card>
			</section>

			<section className="mt-2 px-2">
				<div className="relative overflow-hidden rounded-lg border border-neutral-800 p-6 bg-gradient-to-br from-neutral-900 to-neutral-950">
					<div className="space-y-4 max-w-prose">
						<h2 className="text-lg font-medium flex items-center gap-2">
							Roadmap Milestone <Badge variant="secondary" className="text-[10px]">Q4 2025</Badge>
						</h2>
						<p className="text-sm text-neutral-400">
							The staking module is under active development. Closer to launch we will publish economic parameters, reward schedules, and a public test environment.
						</p>
						<p className="text-xs text-neutral-500">
							DISCLAIMER: All forward-looking statements are estimates and may change prior to release.
						</p>
					</div>
					<div className="pointer-events-none select-none absolute -right-10 -bottom-10 opacity-10 text-[160px] font-black tracking-tighter">
						Q4
					</div>
				</div>
			</section>

			<footer className="pt-4 text-center text-xs text-neutral-600">
				Coming Q4 2025 — Stay tuned.
			</footer>
		</div>
	)
}
