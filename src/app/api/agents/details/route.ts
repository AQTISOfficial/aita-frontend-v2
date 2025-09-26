import { publicEnv } from "@/lib/env.public"

export async function POST(req: Request) {
  const {
    id
  } = await req.json().catch(() => ({}))

  const url = new URL(`${publicEnv.NEXT_PUBLIC_API_URL}/token/${id}`)

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    return new Response("Upstream error", { status: 502 })
  }

  const data = await res.json()
  return Response.json(data)
}
