// app/api/agent/list/route.ts

// Route: POST /api/agent/list
// ---------------------------
// Purpose: Proxy endpoint that forwards agent list queries to the upstream API.
// Notes:
// - Accepts filters from request body (limit, offset, sort, search, address, strategy, userAgents).
// - Builds query params and calls `${NEXT_PUBLIC_API_URL}/tokens`.
// - Ensures responses are cacheable (revalidate: 60).
// - Returns a clean JSON response or 502 on upstream failure.

import { publicEnv } from "@/lib/env.public"

export async function POST(req: Request) {
  // Extract filters from request body, fallback to defaults if parsing fails.
  const {
    limit = 100,
    offset = 0,
    sort = "desc",
    search = "",
    address = "",
    strategy = false,
    userAgents = false,
  } = await req.json().catch(() => ({}))

  // Build upstream URL with query params
  const url = new URL(`${publicEnv.NEXT_PUBLIC_API_URL}/tokens`)
  url.searchParams.set("limit", String(limit))
  url.searchParams.set("offset", String(offset))
  url.searchParams.set("sort", String(sort))
  url.searchParams.set("search", search)
  if (userAgents && address.length > 0) {
    url.searchParams.set("address", address.toLowerCase())
  }
  url.searchParams.set("isBacktested", String(strategy))
  url.searchParams.set("hasContract", String(true))

  // Forward request to upstream with ISR caching
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return new Response("Upstream error", { status: 502 })
  }

  const data = await res.json()
  return Response.json(data)
}
