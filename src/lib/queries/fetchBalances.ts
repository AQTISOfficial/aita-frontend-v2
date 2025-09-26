// /lib/queries/fetchBalances.ts
import { gql } from "@apollo/client";
import { client } from "@/lib/apollo";

/* --------------------
   Query
-------------------- */
export const USER_BALANCES_QUERY = gql`
  query GetUserBalances($userAddress: String!) {
    userBalances(
      where: { userAddress: $userAddress }
      orderBy: balance
      orderDirection: desc
    ) {
      id
      token {
        id
        name
        symbol
        marketCap
        positionId
        reserveUsdc
        reserveAgent
        totalSupply
      }
      userAddress
      balance
    }
  }
`;

/* --------------------
   Types
-------------------- */
export type Token = {
  id: string;
  name: string;
  symbol: string;
  marketCap: string;
  positionId: string;
  reserveUsdc: string;
  reserveAgent: string;
  totalSupply: string;
};

export type UserBalance = {
  id: string;
  token: Token;
  userAddress: string;
  balance: string;
};

/* --------------------
   Fetcher
-------------------- */
export async function fetchBalances(address: string): Promise<UserBalance[]> {
  if (!address) return [];

  const { data } = await client.query<{ userBalances: UserBalance[] }>({
    query: USER_BALANCES_QUERY,
    variables: { userAddress: address.toLowerCase() },
    fetchPolicy: "network-only",
  });

  return data?.userBalances ?? [];
}