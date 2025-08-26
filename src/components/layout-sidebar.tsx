"use client"

import { BotIcon, Vault } from "lucide-react"

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

import {
    IconDashboard,
} from "@tabler/icons-react"

import { Icons } from "./icon"
import { useEffect } from "react"


// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: IconDashboard,
    },
    {
        title: "Agents",
        url: "/agents",
        icon: BotIcon,
    },
    {
        title: "Vaults",
        url: "/vaults",
        icon: Vault,
    },
    // {
    //     title: "Signals",
    //     url: "/signals",
    //     icon: ChartBar,
    // },
    // {
    //     title: "Staking",
    //     url: "/staking",
    //     icon: HandCoins,
    // },
    // {
    //     title: "Portfolio",
    //     url: "/portfolio",
    //     icon: Wallet,
    // },
    // {
    //     title: "Chat",
    //     url: "/chat",
    //     icon: IconSpeakerphone,
    // },
]


export function LayoutSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { open, setOpen } = useSidebar()

    useEffect(() => {
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

        handleChange() // meteen uitvoeren bij mount
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
                            <a href="#">
                                <Icons.logo className="!size-5" />
                                <span className="text-base font-semibold">AITA Protocol</span>
                            </a>
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
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>

            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}