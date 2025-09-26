"use client"

import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { useQuery } from '@tanstack/react-query'
import { DollarSign, Table2, LayoutGrid } from 'lucide-react'
import { fetchBalances, UserBalance } from '@/lib/queries/fetchBalances'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

type BalanceItem = {
  id: string; ticker: string; name: string; marketCap: number; price: number; balance: number; value: number;
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

function transform(balances: UserBalance[]): BalanceItem[] {
  return balances.map(b => {
    const balanceFmt = Number(formatUnits(safeBigInt(b.balance), 18))
    const reserveUsdcFmt = Number(formatUnits(safeBigInt(b.token.reserveUsdc), 6))
    const reserveAgentFmt = Number(formatUnits(safeBigInt(b.token.reserveAgent), 18))
    const marketCapFmt = Number(formatUnits(safeBigInt(b.token.marketCap), 6))
    let price = 0, value = 0
    if (reserveAgentFmt > 0) { price = reserveUsdcFmt / reserveAgentFmt; value = price * balanceFmt }
    return { id: b.id, ticker: b.token.symbol, name: b.token.name, marketCap: marketCapFmt, price, balance: balanceFmt, value }
  })
}

function TableView({ balances }: { balances: BalanceItem[] }) {
  return (
    <table className='w-full text-sm'>
      <thead className='bg-neutral-900/70'>
        <tr>
          <th className='text-left p-2 rounded-tl-lg'>Ticker</th>
          <th className='text-left p-2'>Name</th>
          <th className='text-right p-2'>Market Cap</th>
          <th className='text-right p-2'>Price</th>
          <th className='text-right p-2'>Balance</th>
          <th className='text-right p-2 rounded-tr-lg'>Value</th>
        </tr>
      </thead>
      <tbody>
        {balances.map(b => (
          <tr key={b.id} className='border-t border-neutral-800 hover:bg-neutral-900/40'>
            <td className='font-mono p-2'>{b.ticker}</td>
            <td className='text-neutral-400 p-2'>{b.name}</td>
            <td className='text-right tabular-nums p-2'>${b.marketCap.toLocaleString()}</td>
            <td className='text-right tabular-nums p-2'>${b.price.toFixed(6)}</td>
            <td className='text-right tabular-nums p-2'>{b.balance.toLocaleString()}</td>
            <td className='text-right p-2'>
              <Badge variant={b.value > 0 ? 'default' : 'secondary'}>${b.value.toLocaleString()}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function CardView({ balances }: { balances: BalanceItem[] }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {balances.map(item => (
        <Card key={item.id} className='rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-950 to-neutral-900 p-4 space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='font-mono font-medium'>{item.ticker}</span>
            <Badge variant={item.value > 0 ? 'default' : 'secondary'} className='text-xs'>
              {item.value > 0 ? 'Active' : 'Zero'}
            </Badge>
          </div>
          <div className='text-xs text-neutral-400'>{item.name}</div>
          <div className='grid grid-cols-2 gap-1 text-xs'>
            <span>Market Cap:</span><span>${item.marketCap.toLocaleString()}</span>
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
  const { address, isConnected } = useAccount()
  const { data = [], isLoading, error } = useBalances()
  const balances = transform(data)

  // ✅ Total portfolio value
  const totalValue = balances.reduce((sum, b) => sum + b.value, 0)

  if (!isConnected) return <div className='p-4 text-neutral-400'>Connect your wallet to view your portfolio.</div>
  if (error) return <div className='p-4 text-red-500'>Error loading balances</div>
  if (isLoading) return <div className='p-4 text-neutral-500'>Fetching balances...</div>
  if (balances.length === 0) return <div className='p-6 border border-dashed border-neutral-700 rounded-xl text-center text-neutral-400'>No token balances found.</div>

  return (
    <div className='space-y-6 p-4'>
      {/* Header with toggle + total value */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <h2 className='text-lg font-semibold flex items-center gap-2'>
          Portfolio Value:
          <span className='text-green-500 tabular-nums flex items-center'>
            <DollarSign className='w-5 h-5' />{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </h2>
        <div className='flex justify-end gap-2'>
          <Button variant={view === 'table' ? 'default' : 'outline'} size='sm' onClick={() => setView('table')}>
            <Table2 className='w-4 h-4 mr-1'/> Table
          </Button>
          <Button variant={view === 'cards' ? 'default' : 'outline'} size='sm' onClick={() => setView('cards')}>
            <LayoutGrid className='w-4 h-4 mr-1'/> Cards
          </Button>
        </div>
      </div>

      {view === 'table' ? <TableView balances={balances}/> : <CardView balances={balances}/>}    
    </div>
  )
}