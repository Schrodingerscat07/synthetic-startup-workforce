import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Agent, Permission } from '../../types';
import './NodeEditor.css';

interface NodeEditorProps {
  agent: Agent | null;
  onClose: () => void;
  onUpdatePermission: (agentId: string, permId: string, approved: boolean) => void;
}

export default function NodeEditor({ agent, onClose, onUpdatePermission }: NodeEditorProps) {
  if (!agent) return null;

  return (
    <AnimatePresence>
      <motion.aside
        className="node-editor glass-strong"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="node-editor__header">
          <div className="node-editor__agent-info">
            <div className="node-editor__avatar">{agent.avatar}</div>
            <div>
              <h2 className="node-editor__name mono">{agent.name}</h2>
              <p className="node-editor__title text-muted">{agent.title}</p>
            </div>
          </div>
          <button className="node-editor__close" onClick={onClose} aria-label="Close editor">
            <X size={20} />
          </button>
        </div>

        <div className="node-editor__content">
          <div className="node-editor__section">
            <h3 className="node-editor__section-title">Security & Permissions</h3>
            <p className="node-editor__section-desc text-muted">
              Review and restrict what this agent can do autonomously.
            </p>
            
            <div className="node-editor__permissions">
              {agent.permissions.map((perm: Permission) => {
                const isHighRisk = perm.level === 'write' || perm.level === 'execute';
                return (
                  <div key={perm.id} className="permission-row">
                    <div className="permission-row__info">
                      <span className="permission-row__name">{perm.name}</span>
                      {isHighRisk && (
                        <span className={`badge ${perm.level === 'execute' ? 'badge-error' : 'badge-warning'}`}>
                          {perm.level}
                        </span>
                      )}
                    </div>
                    
                    <button
                      className={`permission-toggle ${perm.approved ? 'permission-toggle--approved' : ''}`}
                      onClick={() => onUpdatePermission(agent.id, perm.id, !perm.approved)}
                    >
                      {perm.approved ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                      <span>{perm.approved ? 'Approved' : 'Restricted'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="node-editor__section">
            <h3 className="node-editor__section-title">Provisioned Tools</h3>
            <div className="node-editor__tools">
              {agent.tools.map((tool) => (
                <div key={tool} className="tool-tag mono">{tool}</div>
              ))}
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
