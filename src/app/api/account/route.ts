import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_AITA_BASEURL as string;

type ProfileBody = {
  telegramUsername?: string;
  referralId?: string;
};

export async function GET(req: NextRequest) {
  try {
    const signature = req.headers.get("signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const res = await fetch(`${API_URL}/profile`, {
      method: "GET",
      headers: {
        Authorization: signature,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // probeer JSON, fallback naar tekst
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Profile proxy error:", err);
    return NextResponse.json({ error: "Proxy request failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const signature = req.headers.get("signature");
    const body: ProfileBody = await req.json();

    if (!signature || !body) {
      return NextResponse.json(
        { error: "Missing signature or body" },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_URL}/profile`, {
      method: "PUT",
      headers: {
        Authorization: signature,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    return NextResponse.json(data, {
      status: res.status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Profile proxy error:", err);
    return NextResponse.json({ error: "Proxy request failed" }, { status: 500 });
  }
}
