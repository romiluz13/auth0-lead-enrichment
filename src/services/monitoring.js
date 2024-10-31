class MonitoringService {
  constructor() {
    this.metrics = {
      researchTime: 0,
      solutionTime: 0,
      outreachTime: 0,
      successRate: 0
    };
  }

  startTimer() {
    return process.hrtime();
  }

  endTimer(start) {
    const diff = process.hrtime(start);
    return (diff[0] * 1e9 + diff[1]) / 1e9; // Returns seconds
  }

  trackExecution(phase, duration, success = true) {
    this.metrics[`${phase}Time`] = duration;
    this.metrics.successRate = success ? 1 : 0;
  }

  getMetrics() {
    return this.metrics;
  }
}

export const monitoring = new MonitoringService(); 