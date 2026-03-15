import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/chatStore';
import ChatMessage from './ChatMessage';
import AgentCard from './AgentCard';
import './ChatWindow.css';

export default function ChatWindow() {
  const { messages, isTyping } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="chat-window">
      <div className="chat-window__messages">
        <AnimatePresence>
          {messages.map((msg) => {
            if (msg.type === 'agent-card' && msg.agentProvisioned) {
              return <AgentCard key={msg.id} agent={msg.agentProvisioned} />;
            }
            return <ChatMessage key={msg.id} message={msg} />;
          })}
        </AnimatePresence>

        {isTyping && (
          <div className="chat-window__typing">
            <div className="chat-window__typing-avatar">🧠</div>
            <div className="chat-window__typing-dots">
              <span className="chat-window__dot" />
              <span className="chat-window__dot" />
              <span className="chat-window__dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
