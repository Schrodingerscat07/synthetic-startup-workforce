/**
 * Web Researcher Service — Backend-Connected
 *
 * Replaced: No more frontend mock — the real research happens
 * server-side via LangGraph (Google Search → Scrape → Summarize).
 * This service just triggers the backend and streams logs.
 */

import { useExecutionStore } from '../stores/executionStore';
import {
  apiStartExecution,
  streamExecution,
  type SSEMessage,
} from './api';
import { getCompanyId } from './orchestrator';
import type { ExecutionLog, ResearchArticle } from '../types';

/**
 * Run the full agent pipeline via the backend.
 * Connects to the SSE stream for real-time log updates.
 * Returns a promise that resolves when execution completes.
 */
export async function runAgentPipeline(): Promise<void> {
  const store = useExecutionStore.getState();
  const companyId = getCompanyId();

  // 1. Trigger execution on the backend
  try {
    await apiStartExecution(companyId);
  } catch (error) {
    console.error('Failed to start execution:', error);
    store.addLog({
      id: crypto.randomUUID(),
      agentId: 'system',
      agentName: 'System',
      action: 'Error',
      detail: 'Failed to connect to backend. Is the server running?',
      timestamp: new Date(),
      status: 'error',
    });
    return;
  }

  // 2. Connect to SSE stream for real-time updates
  return new Promise<void>((resolve) => {
    const cleanup = streamExecution(
      companyId,
      (msg: SSEMessage) => {
        if (msg.type === 'log') {
          const log: ExecutionLog = {
            id: crypto.randomUUID(),
            agentId: msg.data.agent_id,
            agentName: msg.data.agent_name,
            action: msg.data.action,
            detail: msg.data.detail,
            timestamp: new Date(msg.data.timestamp || Date.now()),
            status: msg.data.status as ExecutionLog['status'],
          };
          store.addLog(log);
        } else if (msg.type === 'complete') {
          // Set articles
          if (msg.data.articles?.length) {
            const articles: ResearchArticle[] = msg.data.articles.map((a) => ({
              title: a.title,
              source: a.source,
              url: a.url,
              summary: a.summary,
              scrapedAt: new Date(a.scrapedAt || Date.now()),
            }));
            store.setArticles(articles);
          }

          // Set email
          if (msg.data.draft_email) {
            store.setDraftEmail(msg.data.draft_email);
          }

          resolve();
        }
      },
      (error) => {
        console.error('SSE error:', error);
        store.addLog({
          id: crypto.randomUUID(),
          agentId: 'system',
          agentName: 'System',
          action: 'Connection Error',
          detail: 'Lost connection to execution stream',
          timestamp: new Date(),
          status: 'error',
        });
        resolve();
      },
    );

    // Safety timeout — resolve after 2 minutes if still hanging
    setTimeout(() => {
      cleanup();
      resolve();
    }, 120_000);
  });
}
