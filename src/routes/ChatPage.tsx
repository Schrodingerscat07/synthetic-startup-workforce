import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, Shield, Users } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import ChatWindow from '../components/chat/ChatWindow';
import ChatInput from '../components/chat/ChatInput';
import { initializeChat, processUserVision, processReconfiguration } from '../services/orchestrator';
import './ChatPage.css';

export default function ChatPage() {
  const { phase, userHasSubmitted, isTyping } = useChatStore();
  const navigate = useNavigate();

  const initRan = useRef(false);

  useEffect(() => {
    if (initRan.current) return;
    initRan.current = true;
    
    // Start the welcome sequence on mount only if no messages exist
    const { messages } = useChatStore.getState();
    if (messages.length === 0) {
      initializeChat();
    }
  }, []);

  const handleSubmit = useCallback(
    (message: string) => {
      if (userHasSubmitted) return;
      if (phase === 'customizing') {
        processReconfiguration(message);
      } else {
        processUserVision(message);
      }
    },
    [userHasSubmitted, phase]
  );

  const handleViewTeam = () => {
    navigate('/org-chart');
  };

  return (
    <div className="chat-page">
      {/* --- Sidebar --- */}
      <aside className="chat-page__sidebar">
        <motion.div
          className="chat-page__brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="chat-page__logo">🧠</div>
          <h1 className="chat-page__title">Cerebro AI</h1>
          <p className="chat-page__tagline">Startup-in-a-Box</p>
        </motion.div>

        <div className="chat-page__features">
          <motion.div
            className="chat-page__feature"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Users size={18} />
            <span>AI Workforce</span>
          </motion.div>
          <motion.div
            className="chat-page__feature"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            <Shield size={18} />
            <span>HITL Security</span>
          </motion.div>
          <motion.div
            className="chat-page__feature"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Cpu size={18} />
            <span>Autonomous Ops</span>
          </motion.div>
        </div>

        <div className="chat-page__sidebar-footer">
          <span className="text-dim" style={{ fontSize: 12 }}>
            Powered by Gemini AI
          </span>
        </div>
      </aside>

      {/* --- Main Chat Area --- */}
      <main className="chat-page__main">
        <ChatWindow />

        {/* CTA Button when ready */}
        {phase === 'ready' && (
          <motion.div
            className="chat-page__cta-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button
              id="view-team-button"
              className="chat-page__cta btn btn-lg btn-primary"
              onClick={handleViewTeam}
            >
              <span>Review Your Team</span>
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Input — disabled after submission */}
        <ChatInput
          onSubmit={handleSubmit}
          disabled={userHasSubmitted || isTyping}
          placeholder={
            userHasSubmitted
              ? 'Your workforce is being assembled...'
              : 'Describe your startup vision...'
          }
        />
      </main>
    </div>
  );
}
