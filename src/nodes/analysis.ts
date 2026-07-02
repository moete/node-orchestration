import { DESCRIPTION_BY_METRIC, THRESHOLDS } from "../config";
import { AnalysisResult, Anomaly, LogEntry, ServiceStatusSummary, Severity } from "../types";

export function analyseLogs(logs: LogEntry[]): AnalysisResult {
    const serviceStatusSummary: ServiceStatusSummary = {
        online: [],
        degraded: [],
        offline: []
    };

    logs.forEach((log) => {
        Object.entries(log.service_status).forEach(([serviceName, status]) => {
            serviceStatusSummary[status].push(serviceName);
        });
    });

    return {
        insights: {
            average_latency_ms: average(logs.map((log) => log.latency_ms)),
            max_cpu_usage: Math.max(...logs.map((log) => log.cpu_usage)),
            max_memory_usage: Math.max(...logs.map((log) => log.memory_usage)),
            error_rate: Math.max(...logs.map((log) => log.error_rate)),
            uptime_seconds: Math.max(...logs.map((log) => log.uptime_seconds))
        },
        anomalies: logs.flatMap(detectAnomalies),
        service_status_summary: serviceStatusSummary
    };
}

function detectAnomalies(log: LogEntry): Anomaly[] {
    return Object.entries(THRESHOLDS).flatMap(([metric, threshold]) => {
        const value = log[metric as keyof typeof THRESHOLDS];

        if (value <= threshold) {
            return [];
        }

        return [{
            metric,
            value,
            threshold,
            severity: getSeverity(value, threshold),
            description: DESCRIPTION_BY_METRIC[metric as keyof typeof THRESHOLDS]
        }];
    });
}

function getSeverity(value: number, threshold: number): Severity {
    return value >= threshold * 1.25 ? "high" : "medium";
}

function average(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}
