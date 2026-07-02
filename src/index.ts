import { runPipeline } from "./pipeline";

declare const process: { exitCode: number };

async function main(): Promise<void> {
    await runPipeline();
    console.log("Generated output.json");
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
