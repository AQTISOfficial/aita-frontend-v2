// lib/env.public.ts
import { z } from 'zod'

const noTrailingSlash = z.string().url().transform(s => s.replace(/\/+$/, ''))

const schema = z.object({
  NEXT_PUBLIC_API_URL: noTrailingSlash,
  NEXT_PUBLIC_CLOUDFRONT_BASEURL: noTrailingSlash,
  NEXT_PUBLIC_CLOUDFRONT: z.string().min(1),
  NEXT_PUBLIC_HYPERLIQUID_API_URL: noTrailingSlash,
  NEXT_PUBLIC_RPC_URL_ARBITRUM: noTrailingSlash,
  NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA: noTrailingSlash,
  NEXT_PUBLIC_REOWN_ID: z.string().min(1)
})

export const publicEnv = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLOUDFRONT_BASEURL: process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL,
  NEXT_PUBLIC_CLOUDFRONT: process.env.NEXT_PUBLIC_CLOUDFRONT,
  NEXT_PUBLIC_HYPERLIQUID_API_URL: process.env.NEXT_PUBLIC_HYPERLIQUID_API_URL,
  NEXT_PUBLIC_RPC_URL_ARBITRUM: process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM,
  NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA: process.env.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA,
  NEXT_PUBLIC_REOWN_ID: process.env.NEXT_PUBLIC_REOWN_ID
})