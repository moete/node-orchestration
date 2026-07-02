export type Severity = "low" | "medium" | "high";
export type ServiceStatus = "online" | "degraded" | "offline";

export interface LogEntry {
    timestamp: string;
    cpu_usage: number;
    memory_usage: number;
    latency_ms: number;
    disk_usage: number;
    network_in_kbps: number;
    network_out_kbps: number;
    io_wait: number;
    thread_count: number;
    active_connections: number;
    error_rate: number;
    uptime_seconds: number;
    temperature_celsius: number;
    power_consumption_watts: number;
    service_status: Record<string, ServiceStatus>;
}

export interface Insights {
    average_latency_ms: number;
    max_cpu_usage: number;
    max_memory_usage: number;
    error_rate: number;
    uptime_seconds: number;
}

export interface Anomaly {
    metric: string;
    value: number;
    threshold: number;
    severity: Severity;
    description: string;
}

export type ServiceStatusSummary = Record<ServiceStatus, string[]>;

export interface AnalysisResult {
    insights: Insights;
    anomalies: Anomaly[];
    service_status_summary: ServiceStatusSummary;
}

export type RecommendationParameters = Record<string, string | number | boolean | string[] | number[]>;

export interface Recommendation {
    id: string;
    action: string;
    target: string;
    parameters: RecommendationParameters;
    benefit_estimate: string;
}

export interface InfrastructureReport extends AnalysisResult {
    timestamp: string;
    recommendations: Recommendation[];
}
