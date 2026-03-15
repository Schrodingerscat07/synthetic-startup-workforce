/**
 * Email Drafter Service — Real Implementation
 *
 * Replaces hardcoded email template with LLM-generated personalized emails
 * based on the actual research results from the Web Researcher.
 */

import { useExecutionStore } from '../stores/executionStore';
import { useCompanyStore } from '../stores/companyStore';
import { generateTextStream } from './gemini';
import type { Agent, ExecutionLog } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const EMAIL_SYSTEM_PROMPT = `You are "Herald", an AI Email Outreach Specialist. You craft professional, personalized executive intelligence briefs.

Write a professional email that:
1. Has a compelling subject line (on first line, format: "Subject: ...")
2. Opens with a professional greeting
3. References the specific research findings provided
4. For each finding, include the title and a brief takeaway
5. Ends with a strategic recommendation based on the research
6. Signs off as "Herald (AI Email Outreach Specialist)"

Style:
- Professional but not stiff
- Use numbered lists for the research findings
- Bold key takeaways using **markdown**
- Keep it concise — executives are busy
- Include a call-to-action at the end`;

function createLog(agent: Agent, action: string, detail: string, status: ExecutionLog['status'] = 'running'): ExecutionLog {
  return {
    id: crypto.randomUUID(),
    agentId: agent.id,
    agentName: agent.name,
    action,
    detail,
    timestamp: new Date(),
    status,
  };
}

export async function runEmailOutreach(agent: Agent) {
  const executionStore = useExecutionStore.getState();
  const companyVision = useCompanyStore.getState().companyVision;
  const companyName = useCompanyStore.getState().companyName;
  const articles = executionStore.articles;

  executionStore.addLog(createLog(agent, 'Reading Research Context', `Ingesting ${articles.length} articles from Seeker's research...`));
  await delay(600);

  executionStore.addLog(createLog(agent, 'Analyzing Audience Profile', `Matching content to ${companyName} industry profile...`));
  await delay(500);

  executionStore.addLog(createLog(agent, 'Drafting Email', 'Synthesizing research into an executive intelligence brief...'));

  try {
    const articleSummaries = articles
      .map((a, i) => `${i + 1}. "${a.title}" (${a.source}): ${a.summary}`)
      .join('\n');

    let emailContent = '';
    await generateTextStream(
      EMAIL_SYSTEM_PROMPT,
      `Company: ${companyName}\nCompany Vision: ${companyVision}\n\nResearch findings to include in the email:\n${articleSummaries}\n\nDraft the executive intelligence brief email.`,
      (_chunk, accumulated) => {
        emailContent = accumulated;
        // Live-update the store so the UI shows the email being written in real-time
        useExecutionStore.getState().setDraftEmail(emailContent);
      },
    );

    executionStore.addLog(createLog(agent, 'Email Drafted', 'Executive intelligence brief generated and awaits human review.', 'completed'));
  } catch (error) {
    console.error('Email drafter error:', error);

    // Fallback email
    const fallbackEmail = `Subject: Executive Brief: Key Industry Insights for ${companyName}

Hi Founder,

Here is your requested intelligence report based on our latest industry analysis:

${articles.map((a, i) => `${i + 1}. **${a.title}** (${a.source})
   *Takeaway*: ${a.summary}`).join('\n\n')}

**Recommendation**: Based on these findings, I recommend focusing on the intersection of automation and human oversight — this is where ${companyName} can differentiate.

Shall I queue this brief for distribution to your primary stakeholders?

Best,
Herald (AI Email Outreach Specialist)`;

    useExecutionStore.getState().setDraftEmail(fallbackEmail.trim());
    executionStore.addLog(createLog(agent, 'Email Drafted (Template)', 'Draft email generated from template and awaits human review.', 'completed'));
  }

  executionStore.addLog(createLog(agent, 'Sequence Finished', 'All designated targets processed.', 'completed'));
}
