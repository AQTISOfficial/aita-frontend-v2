"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname } from "next/navigation"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { routeConfig } from "@/lib/routeConfig"
import { publicEnv } from "@/lib/env.public"

import Image from "next/image"

export function GlobalChainGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const chainId = useChainId() 
  const { isConnected, isConnecting } = useAccount()
  const { switchChain } = useSwitchChain()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Precompute longest-prefix route match so that "/" does not swallow more specific paths like "/staking"
  const { requiredChain, matchedRoute } = useMemo(() => {
    const entries = Object.entries(routeConfig)
      .sort((a, b) => b[0].length - a[0].length) // longest path first
    let match: string | undefined
    let chain: number | undefined
    for (const [route, id] of entries) {
      if (route === "/") {
        if (pathname === "/") {
          match = route; chain = id; break
        }
        continue
      }
      if (pathname.startsWith(route)) {
        match = route; chain = id; break
      }
    }
    if (!match && pathname === "/") {
      match = "/"; chain = routeConfig["/"]
    }
    return { requiredChain: chain, matchedRoute: match }
  }, [pathname])

  if (!requiredChain) return <>{children}</>

  if (publicEnv.NEXT_PUBLIC_ENV !== 'production') {
    console.debug('GlobalChainGuard match', { pathname, matchedRoute, requiredChain, chainId })
  }

  // Wait until mounted + wallet connected (or user explicitly not connected) before gating.
  // If not connected we don't show the network mismatch screen yet; app can still prompt connect elsewhere.
  if (!mounted || typeof chainId !== "number" || isConnecting || !isConnected) return <>{children}</>

  const needsSwitch = isConnected && chainId !== requiredChain
  if (!needsSwitch) return <>{children}</>

const ETH_MAINNET = 1
const ETH_SEPOLIA = 11155111
const isDev = publicEnv.NEXT_PUBLIC_ENV !== 'production'
const targetEthChain = isDev ? ETH_SEPOLIA : ETH_MAINNET
const isEth = requiredChain === targetEthChain

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-3 max-w-md">
        <h1 className="text-2xl flex items-center justify-center">
            <Image src="/logo.svg" alt="AITA Logo" width={20} height={20} className="inline-block mr-2" />
            AITA Protocol
        </h1>
        <h2 className="text-lg font-semibold tracking-tight">Wrong Network</h2>
        <p className="text-sm text-muted-foreground">
          This section requires {isEth ? "Ethereum Mainnet" : "Arbitrum"}.<br />You are currently on chain ID {chainId}.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => switchChain({ chainId: requiredChain })}
          className="px-5 py-2.5 rounded-md bg-sky-600 hover:bg-sky-500 text-sm font-medium text-white transition-colors disabled:opacity-60"
        >
          Switch to {isEth ? "Ethereum" : "Arbitrum"}
        </button>
        <button
          onClick={() => location.reload()}
          className="px-5 py-2.5 rounded-md border border-neutral-700 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
        >
          Refresh
        </button>
      </div>
      <p className="text-xs text-muted-foreground/70 max-w-sm">
        If you already switched in your wallet and still see this message, click Refresh.
      </p>
    </div>
  )
}

