import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '../../types';
import './ChatMessage.css';

interface ChatMessageProps {
  message: ChatMessageType;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

export default function ChatMessage({ message }: ChatMessageProps) {
  if (message.type === 'system') {
    return (
      <motion.div
        className="chat-message-system"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
      </motion.div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <motion.div
      className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--orchestrator'}`}
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {!isUser && (
        <div className="chat-message__avatar">
          <span>🧠</span>
        </div>
      )}
      <div className={`chat-message__bubble ${isUser ? 'chat-message__bubble--user' : 'chat-message__bubble--orchestrator'}`}>
        <span dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
      </div>
      {isUser && (
        <div className="chat-message__avatar chat-message__avatar--user">
          <span>👤</span>
        </div>
      )}
    </motion.div>
  );
}
