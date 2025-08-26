"use client";

// Component: VaultChart
// ---------------------
// Purpose: Render an interactive line chart for vault data (account value or PnL).
// Notes:
// - Client Component: depends on React state/hooks and recharts.
// - Supports multiple timeframes (day/week/month/allTime).
// - User can toggle between timeframes and series type (accountValueHistory vs pnlHistory).
// - Includes tooltip formatting and reset option.
// - Wrapper <VaultChart> handles state, <ChartLineLinear> renders chart UI.

import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { TrendingUp, Monitor } from "lucide-react"

import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

import {
  ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart"

// ---------- Types ----------
type PointTuple = [number, string]

type SeriesBlock = {
  accountValueHistory: PointTuple[]
  pnlHistory: PointTuple[]
  vlm: string
}

type AllowedTf = "day" | "week" | "month" | "allTime"
type RawPair =
  | ["day", SeriesBlock]
  | ["week", SeriesBlock]
  | ["month", SeriesBlock]
  | ["allTime", SeriesBlock]
  | ["perpDay", SeriesBlock]
  | ["perpWeek", SeriesBlock]
  | ["perpMonth", SeriesBlock]
  | ["perpAllTime", SeriesBlock]

type SeriesKey = keyof Pick<SeriesBlock, "accountValueHistory" | "pnlHistory">

// ---------- Helpers ----------
const chartConfig = {
  desktop: { label: "Desktop", icon: Monitor, color: "var(--color-teal-500)" },
} satisfies ChartConfig

// Format ticks depending on timeframe
function fmtTick(ts: number, tf: AllowedTf) {
  const d = new Date(ts)
  if (tf === "day") {
    return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
  }
  if (tf === "week") {
    return d.toLocaleDateString("nl-NL", { weekday: "short" })
  }
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit" })
}

// Normalize raw API response to only include allowed keys
function normalizeAllowedOnly(raw: RawPair[]) {
  const obj = Object.fromEntries(raw) as Record<string, SeriesBlock>
  const allowed: Partial<Record<AllowedTf, SeriesBlock>> = {}
  if (obj.day) allowed.day = obj.day
  if (obj.week) allowed.week = obj.week
  if (obj.month) allowed.month = obj.month
  if (obj.allTime) allowed.allTime = obj.allTime
  return allowed as Record<AllowedTf, SeriesBlock>
}

// ---------- Base chart ----------
function ChartLineLinear({
  block,
  timeframe,
  series,
  title,
  subtitle,
}: {
  block: SeriesBlock | undefined
  timeframe: AllowedTf
  series: SeriesKey
  title: string
  subtitle?: string
}) {
  const chartData = useMemo(
    () => {
      const rows = block?.[series] ?? []
      return rows.map(([ts, v]) => ({ ts, value: Number(v) }))
    },
    [block, series]
  )

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle ?? "Timeframe Vault"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="ts"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) => fmtTick(value as number, timeframe)}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            <YAxis
              dataKey="value"
              type="number"
              domain={["auto", "auto"]}
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              width={56}
              tickFormatter={(value) =>
                typeof value === "number"
                  ? value.toLocaleString("en-US", {
                    style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                      minimumFractionDigits: 2,
                    })
                  : value
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideIndicator={false}
                  labelFormatter={(_label, items) => {
                    const ts = (items?.[0]?.payload as { ts: number })?.ts as number
                    return new Date(ts).toLocaleString("en-US", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                  formatter={(val, _name) => {
                    const num = typeof val === "number" ? val : Number(val ?? 0)
                    const formatted = num.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 2,
                    })
                    return [formatted]
                  }}
                />
              }
            />
            <Line
              dataKey="value"
              type="linear"
              stroke="var(--color-desktop)"
              strokeWidth={1}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Indication trend <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {series === "pnlHistory" ? "PnL" : "Account value"} for {timeframe}
        </div>
      </CardFooter>
    </Card>
  )
}

// ---------- Wrapper ----------
export function VaultChart({
  data,
  defaultTimeframe = "allTime",
  defaultSeries = "pnlHistory",
  className,
}: {
  data: RawPair[]
  defaultTimeframe?: AllowedTf
  defaultSeries?: SeriesKey
  className?: string
}) {
  const byKey = useMemo(() => normalizeAllowedOnly(data), [data])
  const [tf, setTf] = useState<AllowedTf>(defaultTimeframe)
  const [series, setSeries] = useState<SeriesKey>(defaultSeries)

  const title =
    series === "pnlHistory"
      ? `PnL ${tf}`
      : `Account value ${tf}`

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Controls: timeframe + series + reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="single"
          value={tf}
          onValueChange={(v) => v && setTf(v as AllowedTf)}
          className="gap-1 bg-neutral-900 border"
        >
          <ToggleGroupItem value="day" aria-label="day" className="px-2 text-xs">Day</ToggleGroupItem>
          <ToggleGroupItem value="week" aria-label="week" className="px-2 text-xs">Week</ToggleGroupItem>
          <ToggleGroupItem value="month" aria-label="month" className="px-2 text-xs">Month</ToggleGroupItem>
          <ToggleGroupItem value="allTime" aria-label="allTime" className="px-4 text-xs">All time</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex space-x-1">
        <Select
          value={series}
          onValueChange={(v) => setSeries(v as SeriesKey)}
          
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Serie" />
          </SelectTrigger>
          <SelectContent
          >
            <SelectItem value="accountValueHistory" className="text-xs">Account value</SelectItem>
            <SelectItem value="pnlHistory" className="text-xs">PnL</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setTf(defaultTimeframe)
            setSeries(defaultSeries)
          }}
        >
          Reset
        </Button>
        </div>
      </div>

      {/* Chart output */}
      <ChartLineLinear
        block={byKey[tf]}
        timeframe={tf}
        series={series}
        title={title}
      />
    </div>
  )
}
