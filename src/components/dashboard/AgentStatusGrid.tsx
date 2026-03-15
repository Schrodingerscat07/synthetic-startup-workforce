import { useExecutionStore } from '../../stores/executionStore';
import type { Agent } from '../../types';
import './AgentStatusGrid.css';

export default function AgentStatusGrid({ agents }: { agents: Agent[] }) {
  const { logs } = useExecutionStore();

  return (
    <div className="agent-grid">
      {agents.map((agent) => {
        // Find the most recent log for this agent to determine status
        const agentLogs = logs.filter((l) => l.agentId === agent.id);
        const lastLog = agentLogs[agentLogs.length - 1];
        
        let status: 'idle' | 'running' | 'completed' | 'error' = 'idle';
        let detail = 'Awaiting instructions';
        
        if (lastLog) {
          status = lastLog.status;
          detail = lastLog.action;
        }

        return (
          <div key={agent.id} className={`status-card status-card--${status}`}>
            <div className="status-card__header">
              <span className="status-card__avatar">{agent.avatar}</span>
              <div className="status-card__info">
                <div className="status-card__name mono">{agent.name}</div>
                <div className="status-card__role text-muted">{agent.role.toUpperCase()}</div>
              </div>
            </div>
            
            <div className="status-card__body">
              <div className="status-card__indicator">
                <span className={`status-dot status-dot--${status}`} />
                <span className="status-text">{status.toUpperCase()}</span>
              </div>
              <div className="status-card__detail" title={detail}>
                {detail}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
