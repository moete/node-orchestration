import { readFile } from "node:fs/promises";
import { z } from "zod";
import { LogEntry } from "../types";

const LogEntrySchema = z.object({
    timestamp: z.string().datetime({ offset: true }),
    cpu_usage: z.number().min(0).max(100),
    memory_usage: z.number().min(0).max(100),
    latency_ms: z.number().min(0),
    disk_usage: z.number().min(0).max(100),
    network_in_kbps: z.number().min(0),
    network_out_kbps: z.number().min(0),
    io_wait: z.number().min(0),
    thread_count: z.number().int().min(0),
    active_connections: z.number().int().min(0),
    error_rate: z.number().min(0).max(1),
    uptime_seconds: z.number().int().min(0),
    temperature_celsius: z.number(),
    power_consumption_watts: z.number().min(0),
    service_status: z.record(z.string(), z.enum(["online", "degraded", "offline"]))
});

const InputSchema = z.union([LogEntrySchema, z.array(LogEntrySchema)]).transform((value) => {
    return Array.isArray(value) ? value : [value];
});

export async function ingestLogs(inputPath: string): Promise<LogEntry[]> {
    const rawContent = await readFile(inputPath, "utf8");
    const rawInput = JSON.parse(rawContent) as unknown;
    const result = InputSchema.safeParse(rawInput);

    if (!result.success) {
        const details = result.error.issues.map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`).join("\n");
        throw new Error(`Invalid input logs:\n${details}`);
    }

    return result.data;
}
