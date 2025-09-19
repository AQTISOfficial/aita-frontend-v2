
// Route: POST /api/agents/details
// ---------------------------
// Purpose: Proxy endpoint that fetches a single agent's details from the upstream API.
// Notes:
// - Accepts an 'id' from the request body.
// - Calls `${NEXT_PUBLIC_API_URL}/token/{id}` to fetch agent details.
// - Ensures responses are cacheable (revalidate: 60).
// - Returns a clean JSON response or 502 on upstream failure.

import { publicEnv } from "@/lib/env.public"

export async function POST(req: Request) {
  // Extract agent id from request body, fallback to empty if parsing fails.
  const {
    id
  } = await req.json().catch(() => ({}))

  // Build upstream URL for agent details
  const url = new URL(`${publicEnv.NEXT_PUBLIC_API_URL}/token/${id}`)

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
