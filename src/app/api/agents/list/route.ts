import { publicEnv } from "@/lib/env.public";

// app/api/agent/list/route.ts
export async function POST(req: Request) {
  const params = await req.json();
  const limit = params.limit || "100";
  const offset = params.offset || "0";
  const sort = params.sort || "desc";   

  const data = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/tokens?limit=${limit}&offset=${offset}&sort=${sort}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    next: {
      revalidate: 60, // Revalidate every 60 seconds
    },
  }).then((res) => res.json());

  return Response.json(data);
}
