# 🚀 WrightFlow AI — Collaborative Content Generation & Editor Suite

WrightFlow AI is a modern, high-performance web application designed to empower content creators, copywriters, and teams with context-aware, generative writing workflows. By pairing a rich-text document editor with deep Google Gemini integrations, WrightFlow simplifies drafting, rewriting, and brainstorming within a unified, premium canvas.

This project was developed in close pair programming with **Antigravity**, an agentic AI coding assistant created by the **Google DeepMind** team.

---

## 📖 Table of Contents

- [✨ Core Features](#-core-features)
- [🤖 Coded with AI: Built by Antigravity](#-coded-with-ai-built-by-antigravity)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [📂 Project Structure](#-project-structure)
- [⚙️ Environment Configuration](#️-environment-configuration)
- [🚀 Local Development Setup](#-local-development-setup)
- [👥 Seed Accounts](#-seed-accounts)

---

## ✨ Core Features

### 📝 Collaborative Tiptap Editor Canvas

- **Rich Text Engine**: Full WYSIWYG capabilities powered by **TipTap**, supporting bold/italic formats, markdown headings, custom code blocks, bullet points, and ordered lists.
- **Auto-Save Mechanism**: Real-time progressive auto-saving to PostgreSQL via debounce hooks, complete with visually clean saving indicator bubbles.
- **Floating Selection Context Toolbar**: Highlights active selections to trigger precise tone alterations.

### 🤖 Gemini AI Generative Assistants

- **Agent 1: Stream Draft Generator**: Progressively writes paragraphs, intros, or sections based on natural language commands, streaming content directly into the editor view using `ReadableStream` interfaces.
- **Agent 2: Contextual Selection Rewriter**: Instantly swaps selected text blocks with rewritten versions altered to **Professional**, **Persuasive**, or **Casual** tones.
- **Agent 3: Sidebar Chat Assistant**: A context-aware chat companion that reads the first 3000 characters of the current document and the last 20 messages of the conversation to help generate ideas, structures, or outlines.

### 📈 Subscription Billing & Rate Limiting

- **Stripe Subscriptions**: Seamless checkouts for tiered plans (`FREE`, `PRO`, `TEAM`).
- **Upstash Redis Sliding Window Rate Limits**: Sliding-window rate limit checks preventing abuse (10 requests/hour for Free users; 100 requests/hour for Pro/Team users) with automatic, non-blocking fallback mechanisms in developer environments.

### 📊 Interactive Analytics Dashboard

- **Usage Metrics**: Beautiful visual analytics powered by **Recharts**, graphing token usage over time.
- **Document History**: Comprehensive dashboard for viewing, organizing, searching, and deleting user documents.

### 🛡️ Portal Administration & Moderation

- **Global Settings Switch**: Turn off AI services instantly or switch on maintenance modes.
- **User Moderation**: Manage user lists, elevate permissions, or ban/unban offending users.
- **Template Manager**: Edit prompt parameters, seed rating counts, and approve or decline templates submitted by users.
- **Blog Manager**: Write and edit community blog posts.

---

## 🤖 Coded with AI: Built by Antigravity

WrightFlow was developed by pairing a developer with **Antigravity**, Google DeepMind's agentic coding assistant. Through continuous cycles of planning, research, and execution, Antigravity guided the architecture and implementation of the entire codebase:

1. **System Design & Schema Modeling**: Planned and realized the PostgreSQL database architecture using Prisma, designing indexes to maximize read efficiency for documents, templates, and usage analytics logs.
2. **Type-Safe Serverside Orchestration**: Standardized data manipulation pipelines by developing Next.js Server Actions, integrated with `Zod` validation rules to guarantee bulletproof api endpoints.
3. **AI Streaming & Prompt Engineering**: Implemented the stream integration hooks. Antigravity designed the SSE (Server-Sent Events) API nodes that parse raw token streams from the Google GenAI SDK (`@google/genai`) into TipTap nodes.
4. **Premium Dark Mode Styling**: Built glassmorphic layouts, harmonious dark-theme colors, and responsive panels using **Tailwind CSS v4** alongside micro-animations utilizing **Framer Motion** and **GSAP** (GreenSock).
5. **Rate Limiting & Resiliency**: Built sliding window rate checks via Upstash Redis and implemented fail-safes so that external outages do not take down core app editor operations.

---

## 🛠️ Tech Stack & Architecture

WrightFlow is built using modern full-stack web standards:

| Layer                | Technology                                       | Description                                                               |
| :------------------- | :----------------------------------------------- | :------------------------------------------------------------------------ |
| **Core Framework**   | **Next.js 16 (App Router)** & **React 19**       | Server-side rendering, API routes, and Server-Sent Event (SSE) streaming. |
| **Styling & Motion** | **Tailwind CSS v4**, **GSAP**, **Framer Motion** | Sleek glassmorphism, responsive panels, fluid drawer transitions.         |
| **Rich Text Editor** | **TipTap Framework**                             | Custom collaborative node mapping and context menus.                      |
| **Database & ORM**   | **PostgreSQL (Neon)** & **Prisma ORM**           | Relational schemas, pool adapters, and complex indices.                   |
| **AI Processing**    | **Google Gemini SDK (`@google/genai`)**          | Stream processing on text generation models.                              |
| **Security & Auth**  | **NextAuth.js** & **Bcrypt.js**                  | Session-based JSON Web Tokens and password encryption hooks.              |
| **Rate Limiter**     | **Upstash Redis (`@upstash/ratelimit`)**         | Sliding-window requests throttling per user tier.                         |
| **Analytics Charts** | **Recharts**                                     | Real-time usage logs graphs.                                              |

---

## 📂 Project Structure

```text
writeflow/
├── prisma/                 # Database configuration
│   ├── schema.prisma       # Prisma model definitions
│   └── seed.ts             # Default admin, user, and template seed data
├── src/
│   ├── actions/            # Next.js Server Actions (admin, blogs, documents, etc.)
│   ├── app/                # Next.js App Router (pages & API endpoints)
│   │   ├── (auth)/         # Authentication screens (Login, Sign-up)
│   │   ├── (public)/       # Landing page, Pricing, Blog, Explore, Terms
│   │   ├── admin/          # Administration settings, blog, user lists, templates
│   │   ├── api/            # API endpoints (AI streaming, stripe, checkouts, ratelimiting)
│   │   └── dashboard/      # User workspace, document list, editor, billing, usage logs
│   ├── components/         # Reusable UI components
│   │   ├── editor/         # TipTap collaborative workspace components
│   │   └── ui/             # Core elements (buttons, inputs, tables, overlays)
│   ├── hooks/              # Custom React hooks (auto-save, theme selectors)
│   ├── lib/                # Utility classes, Prisma clients, Upstash/Stripe instances
│   └── types/              # TypeScript typings
└── public/                 # Static asset delivery (logos, banners, icons)
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory. You can use the values in `.env.example` as a template:

```env
# Database Connection URL (PostgreSQL)
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[dbname]?schema=public"

# (Optional) For Serverless Connection Pooling (e.g., Neon DB)
# DIRECT_DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"

# NextAuth Configurations
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-random-jwt-key"

# Google Gemini API configurations
GEMINI_API_KEY="AIzaSy..."

# Stripe API configurations (Test Mode)
STRIPE_SECRET_KEY="sk_test_..."

# Imgbb CDN Avatar Hosting Configurations (Optional)
IMGBB_API_KEY="your-imgbb-key"

# EmailJS Configurations for Support Form (Optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID="service_id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="template_id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="public_key"
```

---

## 🚀 Local Development Setup

To get a local development instance of WrightFlow up and running, follow these steps:

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/S-Arafin/WriteFlow.git
cd WriteFlow
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your variables (Database credentials, NextAuth Secret, and your Gemini API key are required).

```bash
cp .env.example .env
```

### 3. Initialize the Database Schema & Seed Data

Generate the Prisma Client types, push the schema models to your PostgreSQL instance, and run the seed script to create test accounts and templates:

```bash
npx prisma generate
npx prisma db push
npm run prepare
npx prisma db seed
```

### 4. Boot Up the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the project!

---

## 👥 Seed Accounts

The seeding script generates two default roles to make local testing simple:

- **Administrator Account**
  - **Email**: `admin@writeflow.com`
  - **Password**: `123456`
  - **Plan**: `TEAM`
  - **Access**: Full access to settings, user status changes, template management, and blogging.

- **Standard User Account**
  - **Email**: `user@writeflow.com`
  - **Password**: `123456`
  - **Plan**: `FREE`
  - **Access**: Full access to personal dashboard, document creating/editing, and template usage (subject to rate limiting).
