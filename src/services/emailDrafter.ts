/**
 * Email Drafter Service — Backend-Connected
 *
 * The actual email drafting now happens server-side inside the LangGraph pipeline.
 * This module is kept for API compatibility but the real work is done by Herald
 * agent in the backend, and results arrive via SSE streaming.
 */

// The email drafting is now part of the agent pipeline.
// Results are streamed via SSE and stored in executionStore.
// This file is kept for import compatibility.

export async function runEmailOutreach(): Promise<void> {
  // No-op — email drafting is handled by the LangGraph pipeline
  // via the Herald agent node. Results arrive through SSE.
  console.log('Email drafting is handled by backend LangGraph pipeline');
}
