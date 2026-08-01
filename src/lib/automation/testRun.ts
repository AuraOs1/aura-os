import { runPlaywrightGoogleDemo } from "./runPlaywrightDemo";

async function main() {
  console.log("=== RUNNING REAL PLAYWRIGHT BROWSER AUTOMATION TEST ===");
  const res = await runPlaywrightGoogleDemo();
  console.log("Result:", JSON.stringify(res, null, 2));
}

main().catch(console.error);
