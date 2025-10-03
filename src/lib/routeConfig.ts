import { CHAIN } from "./chains"

export const routeConfig: Record<string, number> = {
  "/": CHAIN.ARBITRUM.id,
  "/agents": CHAIN.ARBITRUM.id,
  "/vaults": CHAIN.ARBITRUM.id,
  "/portfolio": CHAIN.ARBITRUM.id,
  "/account": CHAIN.ARBITRUM.id,
  "/staking": CHAIN.ETHEREUM.id
}
