"use client";

// Component: SiteHeader
// ---------------------
// Purpose: Render the top application header with page title, sidebar trigger, and wallet connect button.
// Notes:
// - Client Component: depends on `usePathname` (App Router) and local mounted state.
// - Builds breadcrumb-style headerTitle from current path segments.
// - Shows <SidebarTrigger> on the left, title in the middle, and <CustomConnectButton> on the right.
// - Hides content until mounted to avoid hydration mismatch (pathname is client-only).

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { ChevronRight } from "lucide-react"
import { CustomConnectButton } from "./connect-button"

export function SiteHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Ensure component only renders on client after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Split path into parts and render as breadcrumb-like title
  const parts = pathname.split("/").filter(Boolean)

  const headerTitle =
    parts.length > 0
      ? parts.map((p, i) => (
          <span key={p}>
            {i > 0 && <ChevronRight className="mx-1 size-4 inline" />}
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </span>
        ))
      : "Dashboard"

  // Layout: sidebar trigger + dynamic title + wallet connect
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <span className="text-xs lg:text-base font-medium flex items-center py-1 overflow-x-hidden">
          {headerTitle}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  )
}
