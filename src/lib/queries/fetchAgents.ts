// src/lib/queries/fetchAgents.ts
import { gql } from "@apollo/client";
import { client } from "@/lib/apollo";
import { formatUnits } from "viem";
import fetchAgentPrice  from "@/lib/api/fetchAgentPrice";

function safeBigInt(value: string | number | bigint | null | undefined): bigint {
  try {
    if (value === null || value === undefined) return BigInt(0);
    return BigInt(value.toString());
  } catch {
    return BigInt(0);
  }
}

const AGENT_QUERY = gql`
  query GetAgent($id: ID!) {
    agents(where: { id: $id }) {
      id
      name
      symbol
      marketCap
      positionId
      reserveUsdc
      reserveAgent
      totalSupply
      unclaimedUsdcFees
      unclaimedAgentFees
      agentFeesClaimedForCreator
      agentFeesClaimedForProtocol
      usdcFeesClaimedForCreator
    }
  }
`;

export type AgentResponse = {
  id: string;
  name: string;
  symbol: string;
  marketCap: string;
  positionId: string;
  reserveUsdc: string;
  reserveAgent: string;
  totalSupply: string;
  unclaimedUsdcFees: string;
  unclaimedAgentFees: string;
  agentFeesClaimedForCreator: string;
  agentFeesClaimedForProtocol: string;
  usdcFeesClaimedForCreator: string;
};

export type AgentFormatted = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  marketCapFmt: number;
  totalSupply: number;
  unclaimedUsdcFees: string;
  unclaimedAgentFees: string;
  agentFeesClaimedForCreator: string;
  agentFeesClaimedForProtocol: string;
  usdcFeesClaimedForCreator: string;
};

export async function fetchAgent(id: string): Promise<AgentFormatted | null> {
  const { data } = await client.query<{ agents: AgentResponse[] }>({
    query: AGENT_QUERY,
    variables: { id: id.toLowerCase() },
    fetchPolicy: "network-only",
  });

  const agent = data?.agents?.[0];
  if (!agent) return null;

  const reserveUsdcFmt = Number(formatUnits(safeBigInt(agent.reserveUsdc), 6));
  const reserveAgentFmt = Number(formatUnits(safeBigInt(agent.reserveAgent), 18));
  let marketCapFmt = Number(formatUnits(safeBigInt(agent.marketCap), 6));
  let price = 0;

  if (reserveAgentFmt > 0) {
    price = reserveUsdcFmt / reserveAgentFmt;
  }

  // Uniswap V3 LP token → override price & marketcap
  if (Number(agent.positionId) > 0) {
    price = (await fetchAgentPrice({ contract: agent.id })) as unknown as number;
    marketCapFmt = price * Number(formatUnits(safeBigInt(agent.totalSupply), 18));
  }

  return {
    id: agent.id,
    name: agent.name,
    symbol: agent.symbol,
    price,
    marketCapFmt,
    totalSupply: Number(formatUnits(safeBigInt(agent.totalSupply), 18)),
    unclaimedUsdcFees: agent.unclaimedUsdcFees,
    unclaimedAgentFees: agent.unclaimedAgentFees,
    agentFeesClaimedForCreator: agent.agentFeesClaimedForCreator,
    agentFeesClaimedForProtocol: agent.agentFeesClaimedForProtocol,
    usdcFeesClaimedForCreator: agent.usdcFeesClaimedForCreator,
  };
}
