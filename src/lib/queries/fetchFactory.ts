// /lib/queries/fetchFactory.ts
import { gql } from "@apollo/client";
import { client } from "@/lib/apollo";

export const FACTORY_QUERY = gql`
  query GetAgentFactories {
    agentFactories {
      id
      tvl
      cumulativeVolume
    }
  }
`;

export type AgentFactory = {
    id: string;
    tvl: string;
    cumulativeVolume: string;
};

export async function fetchFactoryInformation(): Promise<AgentFactory | null> {
    const { data } = await client.query<{ agentFactories?: AgentFactory[] }>({
        query: FACTORY_QUERY,
        fetchPolicy: "network-only",
    });

    return data?.agentFactories?.[0] ?? null;
}