import { Suspense } from 'react'
import PortfolioClient from './portfolio-client'

export const dynamic = 'force-dynamic'

export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <PortfolioClient />
    </Suspense>
  )
}


