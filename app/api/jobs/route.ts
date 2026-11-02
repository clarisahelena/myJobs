import { NextRequest, NextResponse } from "next/server";
import { buildRequestBody } from "@/lib/types";

const API_BASE = "https://api.jobspipe.dev";

export async function POST(request: NextRequest) {
  const apiKey = process.env.JOBSPIPE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const filters = await request.json();
    const body = buildRequestBody(filters);

    const res = await fetch(`${API_BASE}/v1/jobs/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("JobsPipe error:", res.status, errText);
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Search failed:", err);
    return NextResponse.json(
      { error: "Search request failed" },
      { status: 500 }
    );
  }
}
