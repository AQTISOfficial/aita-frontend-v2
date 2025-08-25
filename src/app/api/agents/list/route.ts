// app/api/agent/list/route.ts
import { publicEnv } from "@/lib/env.public";

export async function POST(req: Request) {
  const { limit = 100, offset = 0, sort = "desc", search = "", address = "", strategy = false, userAgents = false } = await req.json().catch(() => ({}));

  const url = new URL(`${publicEnv.NEXT_PUBLIC_API_URL}/tokens`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sort", String(sort));
  url.searchParams.set("search", search);
  if (userAgents && address.length > 0) url.searchParams.set("address", String(address.toLowerCase()));
  url.searchParams.set("isBacktested", String(strategy));
  url.searchParams.set("hasContract", String(true));

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    return new Response("Upstream error", { status: 502 });
  }

  const data = await res.json();
  return Response.json(data);
}
