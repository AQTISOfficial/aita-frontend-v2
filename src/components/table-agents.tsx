"use client"

import React, { useEffect, useState, useId, use } from "react"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useIsMobile } from "@/hooks/use-mobile"

import { Button } from "@/components/ui/button"

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'


type Agent = {
    id: string
    ticker: string
    contractAddress: string
    name: string
    description?: string
    image: string
    created: number
    backtestingPaid: boolean
    ownerAddress: string
    strategy?: any 
}

export function TableAgents() {
    const [list, setList] = useState<Agent[]>([])
    const [total, setTotal] = useState(0)

    // Parameters for the API request
    const params = {
        limit: 5,
        offset: 0,
        sort: "asc",
    }

    useEffect(() => {
        const fetchlist = async () => {
            const res = await fetch(`/api/agents/list`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                next: {
                    revalidate: 60, // Revalidate every 60 seconds
                },
                body: JSON.stringify(params),
            })
            const data = await res.json()
            setList(data?.data ? data.data : [])
            setTotal(data?.meta?.totalCount ? data.meta.totalCount : 0)
        }

        fetchlist()

        // const interval = setInterval(fetchlist, 5000); // elke 5 sec
        // return () => clearInterval(interval); // cleanup
    }, [])

    return (
        <div className='w-full'>
            <div className='[&>div]:rounded-sm [&>div]:border mb-2'>
                <Table>
                    <TableHeader>
                        <TableRow className='hover:bg-transparent'>
                            <TableHead className='w-[80px]'>Agent</TableHead>
                            <TableHead>Ticker</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Strategy</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className='flex items-center gap-3'>
                                        <Avatar>
                                            <AvatarImage src={item.image} alt={item.name} />
                                            <AvatarFallback className='text-xs'>{item.name}</AvatarFallback>
                                        </Avatar>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <TableCellViewer item={item} />
                                </TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.ownerAddress}</TableCell>
                                <TableCell>{item.strategy ? 'Yes' : 'No'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function TableCellViewer({ item }: { item: any }) {
    const isMobile = useIsMobile()

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button variant="link" className="text-foreground w-fit px-0 text-left">
                    {item.ticker}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>{item.ticker}</DrawerTitle>
                    <DrawerDescription>

                    </DrawerDescription>
                </DrawerHeader>
                <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">

                </div>
                <DrawerFooter>
                    <Button>Details</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Close</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}


