import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  console.log("cron job ran at " + new Date().toISOString());

  return NextResponse.json({
    message: "cron ran at" + new Date().toISOString(),
  });
}
