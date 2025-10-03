"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { CustomConnectButton } from "./connect-button";
import { Button } from "./ui/button";
import { useAccount } from "wagmi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

function toLabel(seg: string) {
  return seg
    .split(/[-_]/g)
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const { isConnected } = useAccount();

  const createAgent = () => {
    if (!isConnected) return;
    window.location.href = "/agents/create";
  };


  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const parts = pathname.split("/").filter(Boolean);

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b">
        <div className="flex w-full items-center gap-1 px-4 py-2 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />

          <nav
            aria-label="Breadcrumb"
            className="text-xs lg:text-base font-medium flex items-center py-1 overflow-x-auto whitespace-nowrap"
          >
            {parts.length === 0 ? (
              <span>Marketplace</span>
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
            {isConnected ? (
              <Button
                className="bg-white text-black border ml-2 cursor-pointer hover:bg-neutral-200"
                variant="secondary"
                type="button"
                onClick={createAgent}
                disabled={!isConnected}
              >
                Create Agent
              </Button>
            )
              : (
                <Dialog>
                  <DialogTrigger className="text-sm ml-2 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 cursor-pointer">Create Agent</DialogTrigger>
                  <DialogContent className="bg-neutral-900 w-96">
                    <DialogHeader>
                      <DialogTitle>Connect your wallet</DialogTitle>
                      <DialogDescription>
                        In order to create an Agent, please connect your wallet first.
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              )
            }
          </div>
        </div>
      </header>


    </>
  );
}
