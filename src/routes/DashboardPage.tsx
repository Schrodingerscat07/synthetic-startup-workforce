import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useCompanyStore } from '../stores/companyStore';
import { useExecutionStore } from '../stores/executionStore';
import { runWebResearcher } from '../services/webResearcher';
import { runEmailOutreach } from '../services/emailDrafter';

import AgentStatusGrid from '../components/dashboard/AgentStatusGrid';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import ResultsPanel from '../components/dashboard/ResultsPanel';
import './DashboardPage.css';

export default function DashboardPage() {
  const { agents } = useCompanyStore();
  const { isRunning, setRunning } = useExecutionStore();
  
  // Ref to ensure we only trigger the simulation once on mount
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || isRunning || agents.length === 0) return;
    hasStarted.current = true;
    
    const runSimulation = async () => {
      setRunning(true);
      
      // 1. Find the agents
      const researcher = agents.find(a => a.id === 'agent-web-researcher');
      const emailer = agents.find(a => a.id === 'agent-email-outreach');
      
      if (researcher && emailer) {
        // 2. Run the sequence
        await runWebResearcher(researcher);
        await runEmailOutreach(emailer);
      }
      
      setRunning(false);
    };

    runSimulation();
  }, [agents, isRunning, setRunning]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div className="dashboard-page__title-group">
          <Activity size={24} className="text-secondary" />
          <h1 className="dashboard-page__title">Live Execution Dashboard</h1>
        </div>
        <div className="dashboard-page__status">
          <span className={`status-dot ${isRunning ? 'status-dot--running' : 'status-dot--completed'}`} />
          <span className="mono">
            SYSTEM STATUS: {isRunning ? 'EXECUTING WORKFLOW' : 'OPERATIONS COMPLETED'}
          </span>
        </div>
      </header>

      <main className="dashboard-page__main">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AgentStatusGrid agents={agents} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <ActivityFeed />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ResultsPanel />
        </motion.div>
      </main>
    </div>
  );
}
