"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Table2, LayoutGrid } from 'lucide-react'
import { fetchBalances, UserBalance } from '@/lib/queries/fetchBalances'
import fetchAgentPrice from '@/lib/api/fetchAgentPrice'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import Image from 'next/image'

type BalanceItem = {
  id: string; ticker: string; name: string; positionId: string; marketCap: number; price: number; balance: number; value: number;
}

const safeBigInt = (val?: string | number | null) => {
  try { return BigInt(val ?? '0') } catch { return BigInt(0) }
}

function useBalances() {
  const { address } = useAccount()
  return useQuery<UserBalance[]>({
    queryKey: ['balances', address?.toLowerCase()],
    queryFn: async () => address ? fetchBalances(address) : [],
    enabled: !!address,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  })
}

async function transform(balances: UserBalance[]): Promise<BalanceItem[]> {
  return Promise.all(
    balances.map(async b => {
      const balanceFmt = Number(formatUnits(safeBigInt(b.balance), 18))
      const reserveUsdcFmt = Number(formatUnits(safeBigInt(b.token.reserveUsdc), 6))
      const reserveAgentFmt = Number(formatUnits(safeBigInt(b.token.reserveAgent), 18))
      let marketCapFmt = Number(formatUnits(safeBigInt(b.token.marketCap), 6))
      let price = 0, value = 0
      if (reserveAgentFmt > 0) { price = reserveUsdcFmt / reserveAgentFmt; value = price * balanceFmt }
      if (Number(b.token.positionId) > 0) {
        // Uniswap V3 LP token
        price = await fetchAgentPrice({ contract: b.token.id }) as unknown as number
        value = price * balanceFmt
        marketCapFmt = price * Number(formatUnits(safeBigInt(b.token.totalSupply), 18))
      }
      return { id: b.id, ticker: b.token.symbol, name: b.token.name, positionId: b.token.positionId, marketCap: marketCapFmt, price, balance: balanceFmt, value }
    })
  )
}

function TableView({ balances }: { balances: BalanceItem[] }) {
  return (
    <div className='overflow-x-auto px-2'>
      <table className='w-full text-sm'>
        <thead className='bg-neutral-900/70'>
          <tr>
            <th className='text-left p-2 rounded-tl-lg'>Ticker</th>
            <th className='text-left p-2'>Name</th>
            <th className='text-right p-2'>Market Cap</th>
            <th className='text-right p-2'>Price</th>
            <th className='text-right p-2'>Balance</th>
            <th className='text-right p-2'>Value</th>
            <th className='text-right p-2 rounded-tr-lg'></th>
          </tr>
        </thead>
        <tbody>
          {balances.map(b => (
            <tr key={b.id} className='border-t border-neutral-800 hover:bg-neutral-900/40'>
              <td className='font-mono p-2'>{b.ticker}</td>
              <td className='text-neutral-400 p-2'>{b.name}</td>
              <td className='text-right tabular-nums p-2'>${b.marketCap.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              <td className='text-right tabular-nums p-2'>${b.price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</td>
              <td className='text-right tabular-nums p-2'>{b.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              <td className='text-right p-2'>
                <Badge variant={b.value > 0 ? 'default' : 'secondary'}>${b.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Badge>
              </td>
              <td className='text-right p-2'>
                {Number(b.positionId) > 0 && (
                  <span className='bg-white p-1 rounded-full inline-block'>
                    <Image src="/images/agents/uniswap.svg" alt="Uniswap" width={16} height={16} />
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CardView({ balances }: { balances: BalanceItem[] }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-2'>
      {balances.map(item => (
        <Card key={item.id} className='rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900 p-4 space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='font-mono font-medium'>{item.ticker}</span>
            {Number(item.positionId) > 0 && (
              <span className='bg-white p-1 rounded-full'>
                <Image src="/images/agents/uniswap.svg" alt="Uniswap" width={16} height={16} />
              </span>
            )}
          </div>
          <div className='text-xs text-neutral-400'>{item.name}</div>
          <div className='grid grid-cols-2 gap-1 text-xs'>
            <span>Market Cap:</span><span>${item.marketCap.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span>Price:</span><span>${item.price.toLocaleString(undefined, { minimumFractionDigits: 7, maximumFractionDigits: 7 })}</span>
            <span>Balance:</span><span>{item.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span>Value:</span>
            <span className='flex items-center font-semibold text-green-500'>
              <DollarSign className='w-4 h-4' />{item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default function PortfolioClient() {
  const [view, setView] = useState<'table' | 'cards'>('cards')
  const { isConnected } = useAccount()

  const { data: rawBalances, isLoading, isFetching, error } = useBalances()
  const [balances, setBalances] = useState<BalanceItem[]>([])
  const transformingRef = useRef(false)

  useEffect(() => {
    if (!isConnected) {
      if (balances.length) setBalances([])
      return
    }
    if (!rawBalances) return

    if (transformingRef.current) return
    let cancelled = false
    transformingRef.current = true
      ; (async () => {
        try {
          const next = await transform(rawBalances)
          if (!cancelled) setBalances(next)
        } catch {
          if (!cancelled) setBalances([])
        } finally {
          transformingRef.current = false
        }
      })()
    return () => { cancelled = true }
  }, [rawBalances, isConnected])

  const totalValue = balances.reduce((sum, b) => sum + b.value, 0)

  if (!isConnected) {
    return <div className='p-4 text-neutral-400'>Connect your wallet to view your portfolio.</div>
  }
  if (error) {
    return <div className='p-4 text-red-500'>Error loading balances</div>
  }
  if (isLoading || isFetching) {
    return <div className='p-4 text-neutral-500'>Fetching balances...</div>
  }
  if (rawBalances && rawBalances.length === 0) {
    return <div className='p-6 border border-dashed border-neutral-700 rounded-xl text-center text-neutral-400'>No token balances found.</div>
  }
  if (rawBalances && rawBalances.length > 0 && balances.length === 0) {
    return <div className='p-4 text-neutral-500'>Processing balances...</div>
  }

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between px-2 gap-3 md:gap-4 mb-2 lg:mb-4">
        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2 sm:gap-3">
            Portfolio Value:
            <span className='text-green-500 tabular-nums flex items-center'>
              <DollarSign className='w-5 h-5' />{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>

          </h1>
          <p className="text-sm text-neutral-400 max-w-prose">
            Overview of your token holdings and their current market value.
          </p>
        </div>
        <div className="flex flex-col items-end justify-end gap-2">
          <Badge variant="outline" className="text-xs border-green-500/40 text-green-300 bg-green-500/5">Live<span className="text-green-300 rounded-full bg-green-400 animate-pulse h-2 w-2"></span></Badge>
          <div className='flex flex-col md:flex-row md:items-center justify-end gap-4'>
            <div className='flex justify-end gap-2'>
              <Button variant={view === 'table' ? 'default' : 'outline'} size='sm' onClick={() => setView('table')}>
                <Table2 className='w-4 h-4 mr-1' /> Table
              </Button>
              <Button variant={view === 'cards' ? 'default' : 'outline'} size='sm' onClick={() => setView('cards')}>
                <LayoutGrid className='w-4 h-4 mr-1' /> Cards
              </Button>
            </div>
          </div>
        </div>
      </header>

      {view === 'table' ? <TableView balances={balances} /> : <CardView balances={balances} />}

    </>
  )
}