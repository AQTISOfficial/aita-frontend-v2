import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Agents</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {Math.floor(Math.random() * 2000).toLocaleString()}
            </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-teal-500">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up 12.5% this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Performance exceeds expectations
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cumulative Volume</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${Math.floor(Math.random() * 1_000_000).toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-teal-500">
              <IconTrendingUp />
              +31%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up 31% from last month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Strong growth in trading volume
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Value Locked</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${Math.floor(Math.random() * 2_000_000).toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-teal-500">
              <IconTrendingUp />
              +18%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up 18% this quarter <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Significant increase in TVL
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
