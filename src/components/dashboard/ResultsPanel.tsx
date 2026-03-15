import { motion } from 'framer-motion';
import { useExecutionStore } from '../../stores/executionStore';
import { Database, Mail, ExternalLink } from 'lucide-react';
import './ResultsPanel.css';

export default function ResultsPanel() {
  const { articles, draftEmail } = useExecutionStore();

  return (
    <div className="results-panel">
      {/* Left side: Research Data */}
      <div className="results-card glass-strong">
        <div className="results-card__header">
          <Database size={18} className="text-secondary" />
          <h3 className="results-card__title">Compiled Research Data</h3>
          {articles.length > 0 && (
            <span className="badge badge-success">{articles.length} items</span>
          )}
        </div>
        
        <div className="results-card__content">
          {articles.length === 0 ? (
            <div className="results-card__empty text-muted">
              Waiting for Seeker to populate database...
            </div>
          ) : (
            <div className="article-list">
              {articles.map((article, i) => (
                <motion.div 
                  key={i} 
                  className="article-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="article-item__source mono text-primary">{article.source}</div>
                  <h4 className="article-item__title">
                    {article.title}
                    <ExternalLink size={12} style={{ marginLeft: 6, opacity: 0.5 }} />
                  </h4>
                  <p className="article-item__summary text-muted">{article.summary}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Drafted Email */}
      <div className="results-card glass-strong">
        <div className="results-card__header">
          <Mail size={18} className="text-secondary" />
          <h3 className="results-card__title">Drafted Intelligence Brief</h3>
        </div>
        
        <div className="results-card__content">
          {!draftEmail ? (
            <div className="results-card__empty text-muted">
              Waiting for Herald to draft email...
            </div>
          ) : (
            <motion.div 
              className="email-preview mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="email-preview__actions">
                <span className="badge badge-primary">READY FOR REVIEW</span>
                <button className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }}>
                  Edit Draft
                </button>
              </div>
              <pre className="email-preview__text">
                {draftEmail}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
