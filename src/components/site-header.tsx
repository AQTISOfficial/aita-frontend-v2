"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { CustomConnectButton } from "./connect-button"

export function SiteHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const parts = pathname.split("/").filter(Boolean)

  const headerTitle = parts.length > 0
    ? parts.map((p, i) => (
        <span key={p}>
          {i > 0 && <ChevronRight className="mx-1 size-4 inline" />}
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </span>
      ))
    : "Dashboard"
        
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <span className="text-base font-medium flex items-center py-1">{headerTitle}</span>
        <div className="ml-auto flex items-center gap-2"><CustomConnectButton /></div>
      </div>
    </header>
  )
}
