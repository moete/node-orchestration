import { ACTION_BY_METRIC } from "../config";
import { AnalysisResult, Recommendation } from "../types";

export function recommendActions(analysis: AnalysisResult): Recommendation[] {
    const recommendations = analysis.anomalies.map<Recommendation>((anomaly, index) => {
        const mappedAction = ACTION_BY_METRIC[anomaly.metric] ?? {
            action: "Review metric and tune infrastructure configuration.",
            benefit_estimate: "Improves operational stability."
        };

        return {
            id: `REC-${String(index + 1).padStart(3, "0")}`,
            action: mappedAction.action,
            target: anomaly.metric,
            parameters: {
                current_value: anomaly.value,
                threshold: anomaly.threshold,
                severity: anomaly.severity
            },
            benefit_estimate: mappedAction.benefit_estimate
        };
    });

    if (analysis.service_status_summary.degraded.length > 0) {
        recommendations.push({
            id: `REC-${String(recommendations.length + 1).padStart(3, "0")}`,
            action: "Investigate degraded services and add health checks.",
            target: "service_status",
            parameters: {
                services: analysis.service_status_summary.degraded
            },
            benefit_estimate: "Improves incident detection and service availability."
        });
    }

    return recommendations;
}
