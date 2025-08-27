"use client";

// Component: SiteHeader
// ---------------------
// Purpose: Render the top application header with page title, sidebar trigger, and wallet connect button.
// Notes:
// - Client Component: depends on `usePathname` (App Router) and local mounted state.
// - Builds breadcrumb-style headerTitle from current path segments.
// - Shows <SidebarTrigger> on the left, title in the middle, and <CustomConnectButton> on the right.
// - Hides content until mounted to avoid hydration mismatch (pathname is client-only).

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { CustomConnectButton } from "./connect-button";

function toLabel(seg: string) {
  // mooier label: "ai_agents" -> "Ai Agents"
  return seg
    .split(/[-_]/g)
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const parts = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
      <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />

        <nav
          aria-label="Breadcrumb"
          className="text-xs lg:text-base font-medium flex items-center py-1 overflow-x-auto whitespace-nowrap"
        >
          {parts.length === 0 ? (
            <span>Dashboard</span>
          ) : (
            parts.map((seg, i) => {
              const label = toLabel(seg);
              const isFirst = i === 0;
              const key = `${seg}-${i}`;
              return (
                <span key={key} className="inline-flex items-center">
                  {i > 0 && (
                    <ChevronRight aria-hidden className="mx-1 size-4 inline" />
                  )}
                  {isFirst ? (
                    <Link
                      href={`/${parts[0]}`}
                      className="hover:text-neutral-300"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span>{label}</span>
                  )}
                </span>
              );
            })
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CustomConnectButton />
        </div>
      </div>
    </header>
  );
}
