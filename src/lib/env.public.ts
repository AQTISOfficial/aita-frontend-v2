// lib/env.public.ts
import { z } from 'zod'

const noTrailingSlash = z.string().url().transform(s => s.replace(/\/+$/, ''))

const schema = z.object({
  NEXT_PUBLIC_API_URL: noTrailingSlash,
  NEXT_PUBLIC_CLOUDFRONT_BASEURL: noTrailingSlash,
  NEXT_PUBLIC_CLOUDFRONT: z.string().min(1),
  NEXT_PUBLIC_HYPERLIQUID_API_URL: noTrailingSlash
})

export const publicEnv = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLOUDFRONT_BASEURL: process.env.NEXT_PUBLIC_CLOUDFRONT_BASEURL,
  NEXT_PUBLIC_CLOUDFRONT: process.env.NEXT_PUBLIC_CLOUDFRONT,
  NEXT_PUBLIC_HYPERLIQUID_API_URL: process.env.NEXT_PUBLIC_HYPERLIQUID_API_URL
})