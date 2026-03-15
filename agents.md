# Cerebro AI — Agent Knowledge Base

> **READ THIS FIRST** before writing any new phase code. This file contains the complete project context, architecture decisions, data models, design tokens, and Phase 1 build log that all agents must be aware of.

---

## 1. Product Vision

**"Startup-in-a-Box"** — A platform where solo entrepreneurs build, staff, and run a company using a synchronized workforce of AI agents, with strict Human-in-the-Loop cybersecurity governance.

The user acts as **The Founder**. They describe their startup vision to an AI Orchestrator, which provisions a team of AI agents organized into a C-Suite hierarchy. Before any agent goes live, the founder **reviews and approves** an interactive org chart — the HITL security checkpoint. Once approved, the AI workforce executes real-world operations autonomously.

### Prototype Scope: "B2B Research Micro-Agency"

| Aspect | Scope |
|---|---|
| **Use Case** | Market Research & Lead Generation Agency |
| **Agents Provisioned** | CEO, CTO, CFO, CMO, COO, Web Researcher, Email Outreach |
| **Execution** | Web Researcher scrapes AI news → Outreach Agent drafts report email |
| **Security Layer** | Interactive org chart with drag, edit, approve/reject |

---

## 2. Architecture Overview

```
Frontend (Vite + React + TypeScript)
├── Chat UI → Orchestrator Engine → Org Chart (React Flow) → Approval Gate → Dashboard
│
State Management (Zustand)
├── chatStore.ts     — messages, typing indicator, conversation phase
├── companyStore.ts  — company info, agents array, approval status
├── executionStore.ts — execution logs, scraped articles, draft email
│
Backend (Simulated in-browser for Prototype)
├── orchestrator.ts  — scripted chat responses with timed agent provisioning
├── webResearcher.ts — simulated web scraping (Phase 3)
├── emailDrafter.ts  — simulated email generation (Phase 3)
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Framework** | Vite + React + TypeScript | Fast dev, type safety, hackathon speed |
| **Org Chart** | React Flow (`@xyflow/react`) | Best-in-class node-based UI, drag/drop, tree layouts |
| **State** | Zustand | Lightweight, no boilerplate, perfect for prototype |
| **Styling** | Vanilla CSS with CSS variables | Full control, no dependency overhead |
| **Routing** | React Router v6 | Multi-page flow (Chat → Org Chart → Dashboard) |
| **Animations** | Framer Motion | Smooth, declarative React animations |
| **Icons** | Lucide React | Consistent, lightweight icon set |
| **Backend** | Simulated in-browser | No server needed for demo; mock API responses with realistic delays |

---

## 3. Application Flow (3 Pages)

| Route | Page | Phase |
|---|---|---|
| `/` | **Vision Chat** — Founder describes idea, Orchestrator provisions agents | Phase 1 ✅ |
| `/org-chart` | **HITL Org Chart** — React Flow canvas, edit permissions, approve/reject | Phase 2 |
| `/dashboard` | **Execution Dashboard** — Agent status, live logs, research report, email draft | Phase 3 |

### Sequence

1. User types startup idea → Orchestrator sends welcome + acknowledges vision
2. Orchestrator provisions C-Suite (CEO, CTO, CFO, CMO, COO) with animated cards
3. Orchestrator provisions Workers (Web Researcher, Email Outreach)
4. "Review Your Team →" CTA appears → navigates to `/org-chart`
5. User reviews/edits org chart → clicks "Approve & Deploy"
6. Dashboard shows live execution → research report → email draft

---

## 4. Data Models (TypeScript)

> **Source of truth**: `src/types/index.ts`

```typescript
// Agent
type AgentRole = 'ceo' | 'cto' | 'cfo' | 'cmo' | 'coo' | 'worker';
type AgentStatus = 'provisioning' | 'idle' | 'working' | 'completed' | 'error';

interface Permission {
  id: string;
  name: string;
  level: 'read' | 'write' | 'execute';
  approved: boolean;
}

interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  title: string;
  avatar: string;       // emoji
  status: AgentStatus;
  permissions: Permission[];
  tools: string[];
  reportsTo: string | null;  // parent agent ID
  description: string;
}

// Company
type CompanyStatus = 'configuring' | 'approved' | 'running' | 'paused' | 'completed';

interface CompanyState {
  id: string;
  name: string;
  vision: string;
  agents: Agent[];
  status: CompanyStatus;
  createdAt: Date;
}

// Chat
type ChatMessageType = 'text' | 'agent-card' | 'transition' | 'system';
type ChatPhase = 'intro' | 'provisioning-csuite' | 'provisioning-workers' | 'customizing' | 'ready';

interface ChatMessage {
  id: string;
  role: 'user' | 'orchestrator' | 'system';
  content: string;
  timestamp: Date;
  agentProvisioned?: Agent;
  type: ChatMessageType;
}

// Execution
interface ExecutionLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  detail: string;
  timestamp: Date;
  status: 'running' | 'completed' | 'error';
}

interface ResearchArticle {
  title: string;
  source: string;
  url: string;
  summary: string;
  scrapedAt: Date;
}
```

---

## 5. Agent Registry

> **Source of truth**: `src/data/agents.ts`

| ID | Name | Role | Title | Avatar | Reports To | Tools |
|---|---|---|---|---|---|---|
| `agent-ceo` | Atlas | CEO | Chief Executive Officer | 👔 | — | task-delegator, report-aggregator |
| `agent-cto` | Nova | CTO | Chief Technology Officer | 💻 | CEO | code-analyzer, api-connector, system-monitor |
| `agent-cfo` | Ledger | CFO | Chief Financial Officer | 📊 | CEO | spreadsheet-engine, cost-tracker |
| `agent-cmo` | Pulse | CMO | Chief Marketing Officer | 📣 | CEO | content-generator, analytics-reader |
| `agent-coo` | Relay | COO | Chief Operations Officer | ⚙️ | CEO | workflow-engine, task-scheduler |
| `agent-web-researcher` | Seeker | Worker | Web Research Specialist | 🔍 | CTO | puppeteer-browser, web-scraper, data-formatter |
| `agent-email-outreach` | Herald | Worker | Email Outreach Specialist | ✉️ | CMO | email-client, template-engine, personalization-engine |

### Hierarchy
```
Atlas (CEO)
├── Nova (CTO)
│   └── Seeker (Web Researcher)
├── Ledger (CFO)
├── Pulse (CMO)
│   └── Herald (Email Outreach)
└── Relay (COO)
```

---

## 6. UI Design Language

### Color Tokens (CSS Variables)

| Token | CSS Variable | Value |
|---|---|---|
| Primary | `--color-primary` | `#6C5CE7` (Electric Violet) |
| Secondary | `--color-secondary` | `#00D2FF` (Cyan Spark) |
| Accent | `--color-accent` | `#FF6B6B` (Coral Alert) |
| Background | `--color-bg` | `#0F0F1A` (Deep Space) |
| Surface | `--color-surface` | `#1A1A2E` (Dark Panel) |
| Text Primary | `--color-text` | `#E8E8FF` |
| Text Muted | `--color-text-muted` | `#8888AA` |
| Text Dim | `--color-text-dim` | `#555577` |
| Success | `--color-success` | `#00E676` |
| Warning | `--color-warning` | `#FFD93D` |
| Error | `--color-error` | `#FF5252` |

### Visual Style Rules
- **Dark mode only** — futuristic, premium feel
- **Glassmorphism** — use `.glass` or `.glass-strong` CSS classes
- **Neon accents** — glowing borders on active elements
- **Monospace font** (`var(--font-mono)`) for agent names
- **Sans-serif** (`var(--font-sans)`) for all other UI text
- **Micro-animations** everywhere — use Framer Motion for React, CSS keyframes for pure CSS
- **Badge classes**: `.badge-primary`, `.badge-secondary`, `.badge-success`, `.badge-warning`, `.badge-error`
- **Button classes**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-lg`

### Available CSS Animations
`fadeIn`, `slideUp`, `slideInLeft`, `slideInRight`, `pulse`, `glow`, `typing-dot`, `border-glow`, `float`

---

## 7. Security Model (HITL)

The Human-in-the-Loop checkpoint is the **core differentiator**:

1. **Permission Granularity**: Each agent has explicit, enumerated permissions
2. **Visual Audit**: The org chart provides an at-a-glance security review
3. **Approval Gate**: Nothing executes until the founder clicks "Approve & Deploy"
4. **Warning System**: Yellow/red badges on agents with high-risk permissions (level: `execute`)
5. **Edit Before Deploy**: Founders can modify permissions, remove tools, or delete agents before approval

---

## 8. File Structure (Current State)

```
synthetic-startup-workforce/
├── agents.md              ← THIS FILE
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx            ✅ Phase 1
    ├── App.tsx             ✅ Phase 1 (React Router: /, /org-chart, /dashboard)
    ├── index.css           ✅ Phase 1 (Full design system)
    ├── types/
    │   └── index.ts        ✅ Phase 1 (All TypeScript interfaces)
    ├── routes/
    │   ├── ChatPage.tsx    ✅ Phase 1 (+ ChatPage.css)
    │   ├── OrgChartPage.tsx  ⬜ Phase 2 (currently placeholder)
    │   └── DashboardPage.tsx ⬜ Phase 3 (currently placeholder)
    ├── components/
    │   ├── chat/
    │   │   ├── ChatWindow.tsx  ✅ (+ .css) — message container, auto-scroll, typing indicator
    │   │   ├── ChatMessage.tsx ✅ (+ .css) — chat bubble with markdown rendering
    │   │   ├── ChatInput.tsx   ✅ (+ .css) — input field with glowing focus
    │   │   └── AgentCard.tsx   ✅ (+ .css) — animated agent provisioning card
    │   ├── org-chart/          ⬜ Phase 2
    │   │   ├── OrgCanvas.tsx      — React Flow canvas
    │   │   ├── AgentNode.tsx      — Custom node component
    │   │   ├── ApprovalBar.tsx    — Bottom approval bar
    │   │   └── NodeEditor.tsx     — Side panel for editing agent properties
    │   └── dashboard/          ⬜ Phase 3
    │       ├── AgentStatusCard.tsx — Agent status with live updates
    │       ├── ActivityFeed.tsx   — Scrolling execution log
    │       ├── ReportPreview.tsx  — Research report panel
    │       └── EmailPreview.tsx   — Draft email panel
    ├── stores/
    │   ├── chatStore.ts      ✅ Phase 1
    │   ├── companyStore.ts   ✅ Phase 1
    │   └── executionStore.ts ✅ Phase 1
    ├── services/
    │   ├── orchestrator.ts   ✅ Phase 1 (simulated chat engine)
    │   ├── webResearcher.ts  ⬜ Phase 3
    │   └── emailDrafter.ts   ⬜ Phase 3
    └── data/
        ├── agents.ts         ✅ Phase 1 (7 agent templates)
        └── mockResponses.ts  ✅ Phase 1 (scripted conversation flow)
```

---

## 9. Installed Dependencies

```json
{
  "react": "^19",
  "react-dom": "^19",
  "react-router-dom": "latest",
  "zustand": "latest",
  "@xyflow/react": "latest",
  "framer-motion": "latest",
  "lucide-react": "latest"
}
```

---

## 10. Phase Build Log

### Phase 1: Foundation & Vision Chat ✅

**Status**: Complete — Build passes (`tsc -b && vite build`, 0 errors, 2156 modules)

**What was built**:
- Full design system with CSS variables, glassmorphism, animations, dark theme
- 3 Zustand stores (chat, company, execution)
- 7 pre-defined agent templates with permissions, tools, descriptions
- Simulated orchestrator service with scripted provisioning flow
- 4 chat components (ChatMessage, AgentCard, ChatInput, ChatWindow)
- ChatPage with sidebar branding and CTA "Review Your Team" button
- React Router with 3 routes (Chat, OrgChart placeholder, Dashboard placeholder)

**Known issue fixed**: `ChatPage.tsx` originally had `../../` import paths instead of `../` — corrected.

### Phase 2: HITL Org Chart & Approval ⬜

**Planned**:
- React Flow interactive org chart at `/org-chart`
- Custom `AgentNode` components showing agent info
- Click-to-edit sidebar for modifying permissions, tools, reporting chain
- Approval bar with "Approve & Deploy" / "Reject & Reconfigure"
- Security badges (yellow for write, red for execute permissions)
- Saves approved state to `companyStore` → redirects to `/dashboard`

### Phase 3: Dashboard & Agent Execution ⬜

**Planned**:
- Execution dashboard at `/dashboard`
- Agent status cards with real-time state animation (idle → working → completed)
- Activity feed with scrolling execution logs
- Web Researcher simulation (canned AI news data or Puppeteer MCP scraping)
- Email Outreach simulation (auto-drafts research report email)
- Report & email preview panels

### Phase 4: Polish & Demo Readiness ⬜

**Planned**:
- End-to-end flow testing
- Loading states, skeleton screens, transitions
- Page-to-page Framer Motion transitions
- Responsive design for 1920×1080 presentation
- Demo script & video recording

---

## 11. Important Conventions

1. **All styling uses vanilla CSS** with CSS variables defined in `src/index.css`. No Tailwind.
2. **All animations use Framer Motion** for React components, CSS `@keyframes` for pure CSS.
3. **State management is via Zustand** — import from `src/stores/`. Stores are accessed via hooks.
4. **Agent data templates are in `src/data/agents.ts`** — use `getAgentTemplate(key)` to get a deep copy.
5. **Components are organized by feature** (chat/, org-chart/, dashboard/).
6. **Routes are in `src/routes/`** — one file per page.
7. **Services are in `src/services/`** — simulation logic, no real backend.
8. **Import paths from routes/**: Use `../` (one level up to `src/`), NOT `../../`.
