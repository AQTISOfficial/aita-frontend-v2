"use client"

import { useEffect, useState } from "react"
import { fetchAgent, type AgentFormatted } from "@/lib/queries/fetchAgents"

type Props = { tokenAddress: string }

export function AgentInfo({ tokenAddress }: Props) {
    const [data, setData] = useState<AgentFormatted | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        async function run() {
            try {
                setLoading(true)
                setError(null)
                const agent = await fetchAgent(tokenAddress)
                if (!cancelled) setData(agent)
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : 'Failed to load'
                if (!cancelled) setError(message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        if (tokenAddress) run()
        return () => { cancelled = true }
    }, [tokenAddress])

    if (loading) return <p className="text-[10px] text-neutral-500 mb-2">Loading...</p>
    if (error) return <p className="text-[10px] text-red-500 mb-2">{error}</p>
    if (!data) return <p className="text-[10px] text-neutral-500 mb-2">No data</p>

    return (
        <div className="grid grid-cols-2 gap-2 text-xs tabular-nums w-full mb-2">
            <div className="flex items-center justify-between p-2 rounded-sm bg-neutral-800/50">
                <span className="text-neutral-400">Price</span>
                <span className="text-right text-emerald-600 font-mono">${data.price.toLocaleString("en-US", { minimumFractionDigits: 7, maximumFractionDigits: 7 })}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-sm bg-neutral-800/50">
                <span className="text-neutral-400">Mkt Cap</span>
                <span className="text-right font-mono">${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(data.marketCapFmt)}</span>
            </div>
        </div>
    )
}