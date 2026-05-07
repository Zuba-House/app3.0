type AuthMetricName =
  | 'bootstrap_duration_ms'
  | 'refresh_attempt'
  | 'refresh_success'
  | 'refresh_failure'
  | 'refresh_duration_ms'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'session_expired'
  | 'session_restored';

export interface AuthMetricEvent {
  name: AuthMetricName;
  timestamp: number;
  data?: Record<string, string | number | boolean | null | undefined>;
}

type AuthMonitorSink = (event: AuthMetricEvent) => void;

class AuthMonitor {
  private sinks = new Set<AuthMonitorSink>();

  registerSink(sink: AuthMonitorSink): () => void {
    this.sinks.add(sink);
    return () => this.sinks.delete(sink);
  }

  emit(name: AuthMetricName, data?: AuthMetricEvent['data']): void {
    const event: AuthMetricEvent = {
      name,
      data,
      timestamp: Date.now(),
    };
    this.sinks.forEach((sink) => sink(event));
  }
}

export const authMonitor = new AuthMonitor();
