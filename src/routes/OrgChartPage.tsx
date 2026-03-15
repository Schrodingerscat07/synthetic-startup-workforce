import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCompanyStore } from '../stores/companyStore';
import { useChatStore } from '../stores/chatStore';
import OrgCanvas from '../components/org-chart/OrgCanvas';
import ApprovalBar from '../components/org-chart/ApprovalBar';
import type { Agent } from '../types';
import './OrgChartPage.css';

export default function OrgChartPage() {
  const navigate = useNavigate();
  const { resetForReconfiguration } = useChatStore();
  const { agents: initialAgents, setAgents, setStatus } = useCompanyStore();
  
  // Local state tracking edits before final approval
  const [editedAgents, setEditedAgents] = useState<Agent[]>(initialAgents);

  const handleApproveDeploy = () => {
    // Commit the changes to the global store
    setAgents(editedAgents);
    setStatus('approved');
    
    // Proceed to execution dashboard
    navigate('/dashboard');
  };

  const handleRejectReconfigure = () => {
    // Reset chat state so user can ask for changes
    resetForReconfiguration();
    useChatStore.getState().addMessage({
      id: `msg-${Date.now()}-reconfig`,
      role: 'orchestrator',
      content: "Alright, let's make some adjustments. What would you like to change about the team?",
      timestamp: new Date(),
      type: 'text'
    });
    navigate('/');
  };

  return (
    <div className="org-page">
      <header className="org-page__header">
        <button 
          className="btn btn-secondary org-page__back"
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        
        <div className="org-page__titles">
          <motion.h1 
            className="org-page__title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Human-in-the-Loop Security Gate
          </motion.h1>
          <motion.p 
            className="text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Review and approve the operational permissions for your AI workforce.
          </motion.p>
        </div>
        
        <div style={{ width: 100 }} /> {/* Spacer for centering */}
      </header>

      <main className="org-page__main">
        <OrgCanvas 
          initialAgents={initialAgents} 
          onAgentsChange={setEditedAgents} 
        />
        
        <ApprovalBar 
          agents={editedAgents}
          onApprove={handleApproveDeploy}
          onReject={handleRejectReconfigure}
        />
      </main>
    </div>
  );
}
