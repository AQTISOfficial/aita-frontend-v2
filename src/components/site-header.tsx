"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"

export function SiteHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null 
  }

  let headerTitle = "Dashboard"
  if (pathname.includes("/vaults")) {
    headerTitle = "Vaults"
  } else if (pathname.startsWith("/agents")) {
    headerTitle = "Agents"
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <h1 className="text-base font-medium">{headerTitle}</h1>
        <div className="ml-auto flex items-center gap-2"></div>
      </div>
    </header>
  )
}
