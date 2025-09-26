import { publicEnv } from "../env.public";

export const normalizeForCheck = (rawName: string, rawTicker: string) => ({
  name: rawName.trim(),
  ticker: rawTicker.trim().replace(/^\$/, "").toUpperCase(),
});

export const checkAgent = async (name: string, ticker: string) => {
  const params = { name, ticker };
  const resp = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/token/exist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!resp.ok) throw new Error("Uniqueness check failed");
  const data = await resp.json();
  return Boolean(data?.exists);
};