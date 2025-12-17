import { db } from "@/db/db";
import { turfPeakHours } from "@/db/schema";

async function main() {
  console.log("Cleaning all peak_hours data...");
  const result = await db.delete(turfPeakHours).returning();
  console.log(`Deleted ${result.length} entries. Data is now clean.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
