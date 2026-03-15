import { useEffect, useRef } from 'react';
import { useExecutionStore } from '../../stores/executionStore';
import './ActivityFeed.css';

export default function ActivityFeed() {
  const { logs } = useExecutionStore();
  const feedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="activity-feed glass-strong">
      <div className="activity-feed__header">
        <h3 className="activity-feed__title">Live Execution Logs</h3>
        <span className="badge badge-secondary mono">
          {logs.length} events
        </span>
      </div>
      
      <div className="activity-feed__content mono" ref={feedRef}>
        {logs.length === 0 ? (
          <div className="activity-feed__empty text-muted">
            Awaiting agent initialization...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`log-entry log-entry--${log.status}`}>
              <span className="log-entry__time text-dim">
                [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}]
              </span>
              <span className="log-entry__agent" style={{ color: `var(--color-${log.status === 'completed' ? 'success' : 'secondary'})` }}>
                {log.agentName}:
              </span>
              <span className="log-entry__action">
                {log.action}
              </span>
              <span className="log-entry__detail text-muted">
                — {log.detail}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
