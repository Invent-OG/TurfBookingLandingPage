import { db } from "@/db/db";
import { turfs } from "@/db/schema";

export async function GET(req: Request) {
  try {
    const allTurfs = await db
      .select({
        id: turfs.id,
        name: turfs.name,
      })
      .from(turfs);

    return new Response(JSON.stringify(allTurfs), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch turfs" }), {
      status: 500,
    });
  }
}
