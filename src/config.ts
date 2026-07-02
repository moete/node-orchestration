export const THRESHOLDS = {
    cpu_usage: 80,
    memory_usage: 85,
    latency_ms: 200,
    disk_usage: 90,
    io_wait: 10,
    error_rate: 0.01,
    temperature_celsius: 75
} as const;

export const DESCRIPTION_BY_METRIC: Record<keyof typeof THRESHOLDS, string> = {
    cpu_usage: "CPU usage exceeds expected capacity.",
    memory_usage: "Memory usage is above the safe threshold.",
    latency_ms: "Latency is higher than the target response time.",
    disk_usage: "Disk usage is close to capacity.",
    io_wait: "I/O wait indicates storage contention.",
    error_rate: "Error rate is above the accepted service level.",
    temperature_celsius: "Temperature is above the hardware operating target."
};

export const ACTION_BY_METRIC: Record<string, { action: string; benefit_estimate: string }> = {
    cpu_usage: {
        action: "Scale horizontally or redistribute workload.",
        benefit_estimate: "Reduces saturation risk and improves throughput."
    },
    memory_usage: {
        action: "Increase memory allocation or inspect memory leaks.",
        benefit_estimate: "Reduces restart and swapping risk."
    },
    latency_ms: {
        action: "Add caching and review slow upstream dependencies.",
        benefit_estimate: "Improves user-facing response time."
    },
    disk_usage: {
        action: "Increase storage capacity and enable log rotation.",
        benefit_estimate: "Prevents outage caused by full disks."
    },
    io_wait: {
        action: "Move hot data to faster storage or reduce blocking I/O.",
        benefit_estimate: "Improves application responsiveness under load."
    },
    error_rate: {
        action: "Review failing endpoints and add circuit breaker protection.",
        benefit_estimate: "Improves reliability and service-level compliance."
    },
    temperature_celsius: {
        action: "Improve cooling and verify hardware load.",
        benefit_estimate: "Reduces hardware throttling and failure risk."
    }
};
