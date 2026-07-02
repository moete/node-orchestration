import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { END, START, StateGraph } from "@langchain/langgraph";
import { z } from "zod";
import { analyseLogs } from "./nodes/analysis";
import { ingestLogs } from "./nodes/ingestion";
import { recommendActions } from "./nodes/recommendation";
import { AnalysisResult, InfrastructureReport, LogEntry } from "./types";

const PipelineStateSchema = z.object({
    inputPath: z.string(),
    logs: z.custom<LogEntry[]>().optional(),
    analysisResult: z.custom<AnalysisResult>().optional(),
    report: z.custom<InfrastructureReport>().optional()
});

type PipelineState = z.infer<typeof PipelineStateSchema>;

const pipelineGraph = new StateGraph(PipelineStateSchema)
    .addNode("ingestion", async (state: PipelineState): Promise<Partial<PipelineState>> => ({
        logs: await ingestLogs(resolve(state.inputPath))
    }))
    .addNode("analysis", (state: PipelineState): Partial<PipelineState> => ({
        analysisResult: analyseLogs(required(state.logs, "logs"))
    }))
    .addNode("recommendation", (state: PipelineState): Partial<PipelineState> => {
        const logs = required(state.logs, "logs");
        const analysis = required(state.analysisResult, "analysisResult");
        const recommendations = recommendActions(analysis);

        return {
            report: {
                timestamp: logs[logs.length - 1].timestamp,
                insights: analysis.insights,
                anomalies: analysis.anomalies,
                recommendations,
                service_status_summary: analysis.service_status_summary
            }
        };
    })
    .addEdge(START, "ingestion")
    .addEdge("ingestion", "analysis")
    .addEdge("analysis", "recommendation")
    .addEdge("recommendation", END)
    .compile();

export async function runPipeline(inputPath = "input_logs.json", outputPath = "output.json"): Promise<InfrastructureReport> {
    const finalState = await pipelineGraph.invoke({ inputPath });
    const report = required(finalState.report, "report");

    await writeFile(resolve(outputPath), `${JSON.stringify(report, null, 2)}\n`, "utf8");

    return report;
}

function required<T>(value: T | undefined, label: string): T {
    if (value === undefined) {
        throw new Error(`Pipeline state is missing ${label}.`);
    }

    return value;
}
