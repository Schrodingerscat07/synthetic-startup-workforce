import { motion } from 'framer-motion';
import { Shield, Wrench } from 'lucide-react';
import type { Agent } from '../../types';
import './AgentCard.css';

interface AgentCardProps {
  agent: Agent;
}

const roleBadgeMap: Record<string, { label: string; className: string }> = {
  ceo: { label: 'CEO', className: 'badge-primary' },
  cto: { label: 'CTO', className: 'badge-secondary' },
  cfo: { label: 'CFO', className: 'badge-warning' },
  cmo: { label: 'CMO', className: 'badge-success' },
  coo: { label: 'COO', className: 'badge-primary' },
  worker: { label: 'SPECIALIST', className: 'badge-secondary' },
};

export default function AgentCard({ agent }: AgentCardProps) {
  const badge = roleBadgeMap[agent.role] || { label: 'AGENT', className: 'badge-primary' };
  const isWorker = agent.role === 'worker';

  return (
    <motion.div
      className={`agent-card ${isWorker ? 'agent-card--worker' : 'agent-card--csuite'}`}
      initial={{ opacity: 0, scale: 0.9, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="agent-card__header">
        <div className="agent-card__avatar">{agent.avatar}</div>
        <div className="agent-card__info">
          <div className="agent-card__name mono">{agent.name}</div>
          <div className="agent-card__title">{agent.title}</div>
        </div>
        <span className={`badge ${badge.className}`}>{badge.label}</span>
      </div>

      <p className="agent-card__description">{agent.description}</p>

      <div className="agent-card__footer">
        <div className="agent-card__stat">
          <Shield size={13} />
          <span>{agent.permissions.length} permissions</span>
        </div>
        <div className="agent-card__stat">
          <Wrench size={13} />
          <span>{agent.tools.length} tools</span>
        </div>
      </div>

      <div className="agent-card__glow" />
    </motion.div>
  );
}
