// lib/env.server.ts
import 'server-only'
import { z } from 'zod'

const noTrailingSlash = z.string().url().transform(s => s.replace(/\/+$/, ''))

const schema = z.object({
  // Public vars (client-safe)
  NEXT_PUBLIC_API_URL: noTrailingSlash,
  NEXT_PUBLIC_CLOUDFRONT_BASEURL: noTrailingSlash,
  NEXT_PUBLIC_CLOUDFRONT: z.string().min(1),
  NEXT_PUBLIC_HYPERLIQUID_API_URL: noTrailingSlash,
  NEXT_PUBLIC_RPC_URL_ARBITRUM: noTrailingSlash,
  NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA: noTrailingSlash,
  NEXT_PUBLIC_REOWN_ID: z.string().min(1),

  // Server vars (secret)
  AITA_ALCHEMY_API_KEY: z.string().min(1),
  AITA_MORALIS_KEY: z.string().min(1)
})

type Env = z.infer<typeof schema>
type ClientEnvKeys = Extract<keyof Env, `NEXT_PUBLIC_${string}`>
type ServerEnvKeys = Exclude<keyof Env, ClientEnvKeys>

const parsed = schema.parse(process.env)

// Only server vars
export const serverEnv: Pick<Env, ServerEnvKeys> = {
  AITA_ALCHEMY_API_KEY: parsed.AITA_ALCHEMY_API_KEY,
  AITA_MORALIS_KEY: parsed.AITA_MORALIS_KEY
}

// Only public vars (passing on to client)
export const clientEnvFromServer: Pick<Env, ClientEnvKeys> = {
  NEXT_PUBLIC_API_URL: parsed.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLOUDFRONT_BASEURL: parsed.NEXT_PUBLIC_CLOUDFRONT_BASEURL,
  NEXT_PUBLIC_CLOUDFRONT: parsed.NEXT_PUBLIC_CLOUDFRONT,
  NEXT_PUBLIC_HYPERLIQUID_API_URL: parsed.NEXT_PUBLIC_HYPERLIQUID_API_URL,
  NEXT_PUBLIC_RPC_URL_ARBITRUM: parsed.NEXT_PUBLIC_RPC_URL_ARBITRUM,
  NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA: parsed.NEXT_PUBLIC_RPC_URL_ARBITRUM_SEPOLIA,
  NEXT_PUBLIC_REOWN_ID: parsed.NEXT_PUBLIC_REOWN_ID
}
