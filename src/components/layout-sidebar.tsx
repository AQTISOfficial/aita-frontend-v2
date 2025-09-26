"use client"

import { BotIcon, Landmark, Store, Settings, Wallet } from "lucide-react"

import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"

import { Icons } from "./icon"
import { useEffect } from "react"
import Link from "next/link"

// Menu items.
const items = [
    {
        title: "Marketplace",
        url: "/",
        icon: Store,
    },
    {
        title: "Agents",
        url: "/agents",
        icon: BotIcon,
    },
    {
        title: "Vaults",
        url: "/vaults",
        icon: Landmark,
    },
    {
        title: "Portfolio",
        url: "/portfolio",
        icon: Wallet,
    },
]


export function LayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open, setOpen } = useSidebar()

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 1024px)") // lg breakpoint

        const handleChange = () => {
            if (mq.matches) {
                // ≥ lg
                setOpen(true)   // open / expanded
            } else {
                // < lg
                setOpen(false)  // collapsed
            }
        }

        handleChange()
        mq.addEventListener("change", handleChange)
        return () => mq.removeEventListener("change", handleChange)
    }, [setOpen])

    return (
        <Sidebar collapsible="icon"
            {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href="/">
                                <Icons.logo className="!size-5" />
                                <span className="text-base font-semibold">AITA Protocol</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/account">
                                <Settings /> Account Settings
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}