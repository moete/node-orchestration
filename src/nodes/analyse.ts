import { AnalysisResult, Recommendation, RecommendationNode } from "../types";

/** Mapping declaratif metrique -> action concrete. Facile a etendre. */
const ACTION_BY_METRIC: Record<
  string,
  { action: string; target: string; parameters: Record<string, unknown>; benefit: string }
> = {
  cpu_usage: {
    action: "scale_up_compute",
    target: "compute_cluster",
    parameters: { count: 1 },
    benefit: "Reduction estimee de 20-30% de la charge CPU moyenne",
  },
  memory_usage: {
    action: "increase_memory_allocation",
    target: "compute_cluster",
    parameters: { memory_increase_percent: 25 },
    benefit: "Reduction du risque d'OOM et des ralentissements lies au swap",
  },
  latency_ms: {
    action: "enable_caching_or_lb",
    target: "api_gateway",
    parameters: { strategy: "add_cache_layer_or_load_balancer" },
    benefit: "Reduction potentielle de 30-50% de la latence moyenne",
  },
  disk_usage: {
    action: "expand_storage",
    target: "storage_volume",
    parameters: { expand_by_percent: 30 },
    benefit: "Evite la saturation disque et les erreurs d'ecriture",
  },
  error_rate: {
    action: "investigate_and_add_retries",
    target: "api_gateway",
    parameters: { retry_policy: "exponential_backoff", max_retries: 3 },
    benefit: "Reduction du taux d'erreur visible cote utilisateur",
  },
  io_wait: {
    action: "optimize_disk_io",
    target: "storage_volume",
    parameters: { suggestion: "switch_to_ssd_or_optimize_queries" },
    benefit: "Reduction de l'attente I/O et amelioration du throughput",
  },
  temperature_celsius: {
    action: "improve_cooling",
    target: "datacenter_rack",
    parameters: { action: "check_cooling_system" },
    benefit: "Reduction du risque de throttling materiel",
  },
};

function recommendationsForAnomalies(anomalies: AnalysisResult["anomalies"]): Recommendation[] {
  const seen = new Set<string>();
  const recs: Recommendation[] = [];
  let i = 1;

  for (const anomaly of anomalies) {
    if (seen.has(anomaly.metric)) continue;
    seen.add(anomaly.metric);

    const rule = ACTION_BY_METRIC[anomaly.metric] ?? {
      action: "investigate_metric",
      target: anomaly.metric,
      parameters: {},
      benefit: "A determiner",
    };

    recs.push({
      id: `REC-${String(i).padStart(3, "0")}`,
      action: rule.action,
      target: rule.target,
      parameters: rule.parameters,
      benefit_estimate: rule.benefit,
    });
    i += 1;
  }
  return recs;
}

function recommendationsForServices(summary: AnalysisResult["service_status_summary"]): Recommendation[] {
  const recs: Recommendation[] = [];
  for (const service of summary.offline) {
    recs.push({
      id: `REC-SVC-${service}`,
      action: "restart_service",
      target: service,
      parameters: { priority: "urgent" },
      benefit_estimate: "Retablissement immediat du service",
    });
  }
  for (const service of summary.degraded) {
    recs.push({
      id: `REC-SVC-${service}-degraded`,
      action: "investigate_service_health",
      target: service,
      parameters: { priority: "high" },
      benefit_estimate: "Prevention d'une panne complete du service",
    });
  }
  return recs;
}

/**
 * Node 3 - Recommandation
 * Traduit chaque anomalie / statut de service degrade en action concrete,
 * via un mapping declaratif (rule-based, pas de LLM - voir README).
 */
export const recommendationNode: RecommendationNode = (analysis) => [
  ...recommendationsForAnomalies(analysis.anomalies),
  ...recommendationsForServices(analysis.service_status_summary),
];