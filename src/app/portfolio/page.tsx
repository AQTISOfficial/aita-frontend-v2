import { Suspense } from 'react'
import PortfolioClient from './portfolio-client'

export const dynamic = 'force-dynamic'

export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <PortfolioClient />
      </div>
    </Suspense>
  )
}


