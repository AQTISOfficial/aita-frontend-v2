import { publicEnv } from "../env.public";
const apiKey = publicEnv.NEXT_PUBLIC_AITA_MORALIS_KEY as string;

interface FetchAgentPriceParams {
  contract: string;
}

interface MoralisPriceResponse {
  usdPrice?: number;
  [key: string]: unknown;
}

export default async function fetchAgentPrice({
  contract
}: FetchAgentPriceParams): Promise<number> {
  if (!contract || !apiKey) {
    throw new Error("Invalid input parameters");
  }

  try {
    const contractAddress = contract.toLowerCase();
    const url = `https://deep-index.moralis.io/api/v2.2/erc20/${contractAddress}/price?chain=arbitrum&include=percent_change`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "X-API-Key": apiKey,
      },
    });

    if (!response.ok) {
      console.error(`Moralis request failed: ${response.status} ${response.statusText}`);
      return 0;
    }

    const data: MoralisPriceResponse = await response.json();
    return data?.usdPrice ?? 0;
  } catch (err) {
    console.error("Error fetching agent price:", err);
    return 0;
  }
}
