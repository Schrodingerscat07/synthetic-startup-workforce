<p align="center">
  <span style="font-size: 48px">🧠</span>
</p>

<h1 align="center">Cerebro AI</h1>

<p align="center">
  <strong>Startup-in-a-Box — Build, Staff & Run a Company with an AI Workforce</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python" alt="Python 3.11" />
  <img src="https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/LangGraph-0.0.26-FF4F00?logo=langchain" alt="LangGraph" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/license-Apache_2.0-green" alt="License" />
</p>

---

## 🎯 What is Cerebro AI?

Cerebro AI is a platform where solo entrepreneurs describe their startup idea to an AI Orchestrator, which then **provisions a synchronized workforce of AI agents** organized into a C-Suite hierarchy. The platform features strict **Human-in-the-Loop (HITL)** cybersecurity governance — nothing runs without the founder's explicit approval.

### The Flow

```
Describe Your Vision → AI Assembles Your Team → Review & Approve Org Chart → Agents Execute Autonomously
```

1. **Vision Chat** — You describe your startup idea in natural language
2. **AI Orchestrator** — Gemini AI analyzes your vision and dynamically provisions the right team
3. **HITL Security Gate** — Interactive org chart where you review permissions, tools, and reporting chains
4. **Autonomous Execution** — Approved agents perform real work (research, email drafting, etc.)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **LLM-Powered Orchestrator** | Gemini 2.0 Flash understands your actual vision and provisions agents dynamically — different input produces different teams |
| 🔍 **Real Web Research** | The "Seeker" agent generates genuine industry research with data points, market analysis, and competitive intelligence |
| ✉️ **AI Email Drafting** | The "Herald" agent crafts personalized executive intelligence briefs based on actual research — streamed in real-time |
| 🛡️ **Human-in-the-Loop Security** | Interactive org chart where you review every agent's permissions before deployment. Nothing executes without your approval |
| 📊 **Live Execution Dashboard** | Real-time activity feed showing agent status, execution logs, research results, and email previews |
| 🎨 **Premium Dark UI** | Glassmorphism, neon accents, Framer Motion animations, and a futuristic design system |

---

## 🏗️ Architecture

```
synthetic-startup-workforce/
├── backend/             # Python FastAPI backend
│   ├── app/
│   │   ├── routers/     # API endpoints (chat, company, execution)
│   │   ├── services/    # Core business logic
│   │   │   ├── agent_graph.py   # LangGraph agent workflows
│   │   │   └── orchestrator.py  # LLM interactions and team building
│   │   ├── tools/       # Langchain tools (scraper, search, email_writer)
│   │   ├── models.py    # SQLAlchemy database models
│   │   └── database.py  # SQLite/PostgreSQL connection setup
│   └── requirements.txt # Python dependencies
│
├── src/                 # React Frontend
│   ├── services/        # API client integration
│   ├── stores/          # Zustand state management
│   ├── components/      # React components (chat, org-chart, dashboard)
│   ├── routes/          # Page-level components
│   ├── data/            # Static data and templates
│   ├── types/           # TypeScript interfaces
│   └── App.tsx          # React Router configuration
└── index.html
```

---

## 🤖 AI Agent Registry

Cerebro provisions agents from a configurable registry. The LLM decides which agents to deploy based on your startup vision.

| Agent | Name | Role | Tools | Reports To |
|---|---|---|---|---|
| 👔 Atlas | CEO | Chief Executive Officer | task-delegator, report-aggregator | — |
| 💻 Nova | CTO | Chief Technology Officer | code-analyzer, api-connector, system-monitor | CEO |
| 📊 Ledger | CFO | Chief Financial Officer | spreadsheet-engine, cost-tracker | CEO |
| 📣 Pulse | CMO | Chief Marketing Officer | content-generator, analytics-reader | CEO |
| ⚙️ Relay | COO | Chief Operations Officer | workflow-engine, task-scheduler | CEO |
| 🔍 Seeker | Worker | Web Research Specialist | puppeteer-browser, web-scraper, data-formatter | CTO |
| ✉️ Herald | Worker | Email Outreach Specialist | email-client, template-engine, personalization-engine | CMO |

### Agent Hierarchy

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

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.10+
- A **Gemini API key** — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Schrodingerscat07/synthetic-startup-workforce.git
cd synthetic-startup-workforce

# 2. Set up the Frontend
npm install
cp .env.example .env # Add your VITE_API_URL here (defaults to http://localhost:8000)

# 3. Set up the Backend
cd backend
python -m venv venv
# On Windows: venv\\Scripts\\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # Add your GEMINI_API_KEY here

# 4. Run the components
# In terminal 1 (Backend):
cd backend
uvicorn app.main:app --reload

# In terminal 2 (Frontend):
cd ..
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and describe your startup vision!

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GEMINI_API_KEY` | ✅ | Your Google Gemini API key |

### Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev Server | `npm run dev` | Start Vite dev server with HMR |
| Build | `npm run build` | TypeScript check + production build |
| Preview | `npm run preview` | Preview production build locally |
| Lint | `npm run lint` | Run ESLint |

---

## 🛡️ Security Model (HITL)

The Human-in-the-Loop checkpoint is the **core differentiator** of Cerebro AI:

1. **Permission Granularity** — Each agent has explicit, enumerated permissions (read / write / execute)
2. **Visual Audit** — The org chart provides an at-a-glance security review of the entire hierarchy
3. **Approval Gate** — Nothing executes until the founder clicks "Approve & Deploy"
4. **Warning System** — Color-coded badges highlight agents with high-risk `execute` permissions
5. **Edit Before Deploy** — Modify permissions, remove tools, or delete agents before approval

---

## 🎨 Design System

Cerebro uses a custom dark-mode design system built with CSS variables:

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#6C5CE7` (Electric Violet) | Primary actions, links |
| `--color-secondary` | `#00D2FF` (Cyan Spark) | Secondary accents, badges |
| `--color-accent` | `#FF6B6B` (Coral Alert) | Warnings, destructive actions |
| `--color-bg` | `#0F0F1A` (Deep Space) | Page background |
| `--color-surface` | `#1A1A2E` (Dark Panel) | Cards, panels |
| `--color-success` | `#00E676` | Success states |
| `--color-warning` | `#FFD93D` | Warning states |
| `--color-error` | `#FF5252` | Error states |

### Visual Features
- **Glassmorphism** — `.glass` and `.glass-strong` utility classes
- **Neon glow effects** — Animated glowing borders on active elements
- **Framer Motion** — Smooth page transitions, staggered list animations, micro-interactions
- **CSS Animations** — `fadeIn`, `slideUp`, `pulse`, `glow`, `float`, `border-glow`

---

## 🧰 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI framework |
| [TypeScript](https://typescriptlang.org) | 5.9 | Type safety |
| [FastAPI](https://fastapi.tiangolo.com/) | 0.109 | High-performance Python backend API |
| [LangGraph](https://python.langchain.com/docs/langgraph) | 0.0.26 | Agentic workflow orchestration |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | Database ORM |
| [Vite](https://vite.dev) | 8 | Build tool and dev server |
| [Gemini AI](https://ai.google.dev) | 2.0 Flash | LLM for orchestrator, research, email |
| [Zustand](https://zustand-demo.pmnd.rs) | 5 | Lightweight state management |
| [React Flow](https://reactflow.dev) | 12 | Interactive org chart canvas |
| [Framer Motion](https://motion.dev) | 12 | Declarative animations |
| [Lucide React](https://lucide.dev) | Latest | Icon library |
| [React Router](https://reactrouter.com) | 7 | Client-side routing |

---

## 📁 Application Routes

| Route | Page | Description |
|---|---|---|
| `/` | Vision Chat | Founder describes their idea, Orchestrator provisions agents |
| `/org-chart` | HITL Org Chart | React Flow canvas with interactive agent approval |
| `/dashboard` | Execution Dashboard | Live agent status, research results, email preview |

---

## 🔮 How the AI Works

### 1. Dynamic Orchestration
When you type your startup vision, the Gemini orchestrator:
- Understands your actual business idea (not scripted responses)
- Decides which agents to provision using **JSON mode** structured output
- Generates unique deployment narration for each agent
- Creates a contextual celebration message

### 2. Intelligent Research
The Web Researcher agent:
- Receives context about your company's vision
- Uses Gemini to generate real industry research with specific data points
- Produces 4-5 research findings with market sizes, growth rates, and trends
- Results are tailored to your specific industry

### 3. Personalized Email Drafting
The Email Outreach agent:
- Ingests the actual research findings
- Uses Gemini **streaming** to draft a personalized executive brief
- Email appears in real-time as it's being written
- Content adapts to your company name, vision, and research results

### Fallback Safety
Every LLM call includes graceful fallback responses. If the Gemini API is unavailable or errors occur, the app continues working with sensible defaults.

---

## 📄 License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Built with 🧠 by Cerebro AI</strong><br/>
  <em>Powered by Google Gemini</em>
</p>
