import { publicEnv } from "@/lib/env.public"
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from "wagmi/chains"

const IS_DEV = publicEnv.NEXT_PUBLIC_ENV === "development" || publicEnv.NEXT_PUBLIC_ENV === "dev"

export const CHAIN = {
    ETHEREUM: IS_DEV ? sepolia : mainnet,
    ARBITRUM: IS_DEV ? arbitrumSepolia : arbitrum,
}

export const RPC_URLS: Record<number, string> = {
    [mainnet.id]: publicEnv.NEXT_PUBLIC_RPC_URL_ETHEREUM!,
    [sepolia.id]: publicEnv.NEXT_PUBLIC_RPC_URL_SEPOLIA!,
    [arbitrum.id]: publicEnv.NEXT_PUBLIC_RPC_URL_ARBITRUM!,
    [arbitrumSepolia.id]: publicEnv.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA!,
}