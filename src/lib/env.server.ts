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
  NEXT_PUBLIC_AGENT_FACTORY: z.string().min(1).optional(),
  NEXT_PUBLIC_AGENT_SPONSOR: z.string().min(1).optional(),
  NEXT_PUBLIC_AGENT_INIT_MARKETCAP: z.string().min(1),
  NEXT_PUBLIC_AGENT_INIT_SUPPLY: z.string().min(1),
  NEXT_PUBLIC_AITA_ADDRESS: z.string().min(1).optional(),
  NEXT_PUBLIC_USDC_ADDRESS: z.string().min(1).optional(),
  NEXT_PUBLIC_USDC_ARBITRUM_ADDRESS: z.string().min(1).optional(),
  NEXT_PUBLIC_WETH_ADDRESS: z.string().min(1).optional(),
  NEXT_PUBLIC_WETH_ARBITRUM_ADDRESS: z.string().min(1).optional(),
  NEXT_PUBLIC_UNIVERSAL_ROUTER: z.string().min(1).optional(),
  NEXT_PUBLIC_QUOTER_V2_ADDRESS: z.string().min(1).optional(),
  NEXT_PUBLIC_UNISWAP_FACTORY: z.string().min(1).optional(),
  NEXT_PUBLIC_HYPERLIQUID_URL: z.string().min(1).optional(),


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
  NEXT_PUBLIC_REOWN_ID: parsed.NEXT_PUBLIC_REOWN_ID,
  NEXT_PUBLIC_AGENT_FACTORY: parsed.NEXT_PUBLIC_AGENT_FACTORY,
  NEXT_PUBLIC_AGENT_SPONSOR: parsed.NEXT_PUBLIC_AGENT_SPONSOR,
  NEXT_PUBLIC_AGENT_INIT_MARKETCAP: parsed.NEXT_PUBLIC_AGENT_INIT_MARKETCAP,
  NEXT_PUBLIC_AGENT_INIT_SUPPLY: parsed.NEXT_PUBLIC_AGENT_INIT_SUPPLY,
  NEXT_PUBLIC_AITA_ADDRESS: parsed.NEXT_PUBLIC_AITA_ADDRESS,
  NEXT_PUBLIC_USDC_ADDRESS: parsed.NEXT_PUBLIC_USDC_ADDRESS,
  NEXT_PUBLIC_USDC_ARBITRUM_ADDRESS: parsed.NEXT_PUBLIC_USDC_ARBITRUM_ADDRESS,
  NEXT_PUBLIC_WETH_ADDRESS: process.env.NEXT_PUBLIC_WETH_ADDRESS,
  NEXT_PUBLIC_WETH_ARBITRUM_ADDRESS: process.env.NEXT_PUBLIC_WETH_ARBITRUM_ADDRESS,
  NEXT_PUBLIC_UNIVERSAL_ROUTER: process.env.NEXT_PUBLIC_UNIVERSAL_ROUTER,
  NEXT_PUBLIC_QUOTER_V2_ADDRESS: process.env.NEXT_PUBLIC_QUOTER_V2_ADDRESS,
  NEXT_PUBLIC_UNISWAP_FACTORY: process.env.NEXT_PUBLIC_UNISWAP_FACTORY,
  NEXT_PUBLIC_HYPERLIQUID_URL: process.env.NEXT_PUBLIC_HYPERLIQUID_URL
}
