import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { Agent, Permission } from '../../types';
import './AgentNode.css';

export type AgentNodeType = Node<{ agent: Agent }, 'agent'>;

const roleBadgeMap: Record<string, { label: string; className: string }> = {
  ceo: { label: 'CEO', className: 'badge-primary' },
  cto: { label: 'CTO', className: 'badge-secondary' },
  cfo: { label: 'CFO', className: 'badge-warning' },
  cmo: { label: 'CMO', className: 'badge-success' },
  coo: { label: 'COO', className: 'badge-primary' },
  worker: { label: 'SPECIALIST', className: 'badge-secondary' },
};

function AgentNode({ data, selected }: NodeProps<AgentNodeType>) {
  const { agent } = data;
  const badge = roleBadgeMap[agent.role] || { label: 'AGENT', className: 'badge-primary' };

  // Calculate risks
  const writeCount = agent.permissions.filter((p: Permission) => p.level === 'write').length;
  const executeCount = agent.permissions.filter((p: Permission) => p.level === 'execute').length;
  
  const hasRisks = writeCount > 0 || executeCount > 0;

  return (
    <>
      {/* Incoming connections (Top) */}
      {agent.reportsTo && (
        <Handle
          type="target"
          position={Position.Top}
          className="agent-node__handle agent-node__handle--target"
        />
      )}

      <div className={`agent-node ${selected ? 'agent-node--selected' : ''}`}>
        <div className="agent-node__header">
          <div className="agent-node__avatar">{agent.avatar}</div>
          <div className="agent-node__info">
            <div className="agent-node__name mono">{agent.name}</div>
            <div className={`badge ${badge.className}`}>{badge.label}</div>
          </div>
        </div>

        <div className="agent-node__title text-muted">{agent.title}</div>
        
        {hasRisks && (
          <div className="agent-node__risks">
            {writeCount > 0 && <span className="agent-node__risk-dot agent-node__risk-dot--write" title={`${writeCount} Write Permissions`} />}
            {executeCount > 0 && <span className="agent-node__risk-dot agent-node__risk-dot--execute" title={`${executeCount} Execute Permissions`} />}
          </div>
        )}
      </div>

      {/* Outgoing connections (Bottom) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="agent-node__handle agent-node__handle--source"
      />
    </>
  );
}

export default memo(AgentNode);
