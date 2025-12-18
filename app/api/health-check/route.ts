import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export function GET(request: NextApiRequest) {
  console.log("cron job ran at " + new Date().toISOString());
  return new NextResponse("cron ran", { status: 200 });
}
