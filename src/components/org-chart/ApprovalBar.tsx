import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Agent } from '../../types';
import './ApprovalBar.css';

interface ApprovalBarProps {
  agents: Agent[];
  onApprove: () => void;
  onReject: () => void;
}

export default function ApprovalBar({ agents, onApprove, onReject }: ApprovalBarProps) {
  // Check if any high-risk permissions are unapproved
  const unapprovedRisks = agents.some((agent) =>
    agent.permissions.some(
      (p) => (p.level === 'execute' || p.level === 'write') && !p.approved
    )
  );

  return (
    <div className="approval-bar glass-strong">
      <div className="approval-bar__status">
        {unapprovedRisks ? (
          <>
            <ShieldAlert size={24} className="text-warning" />
            <div>
              <h3 className="approval-bar__title text-warning">Action Required</h3>
              <p className="approval-bar__desc text-muted">
                Some high-risk permissions require your explicit approval.
              </p>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 size={24} className="text-success" />
            <div>
              <h3 className="approval-bar__title text-success">All Systems Go</h3>
              <p className="approval-bar__desc text-muted">
                The workforce is configured and ready for deployment.
              </p>
            </div>
          </>
        )}
      </div>

      <div className="approval-bar__actions">
        <button className="btn btn-danger" onClick={onReject}>
          Reject & Revise
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onApprove}
          disabled={unapprovedRisks} // Must approve all risks to deploy
          style={{ paddingLeft: '24px', paddingRight: '24px' }}
        >
          Approve & Deploy
        </button>
      </div>
    </div>
  );
}
