import { Shield, Lock, Eye, FileText, CheckCircle } from 'lucide-react';
import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen space-y-12 bg-neutral-950 px-4 py-16">
      {/* Privacy Hero */}
      <div className="container mx-auto max-w-4xl space-y-6 text-center">
        <span className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-indigo-500 uppercase">
          <Shield className="h-4 w-4" />
          Security Registry
        </span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-lg">
          Last updated: May 31, 2026. Review our operational parameters,
          encryption protocols, and model boundary configurations.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto grid max-w-4xl grid-cols-1 gap-12 text-left lg:grid-cols-4">
        {/* Sticky Sidebar Navigation */}
        <div className="sticky top-24 hidden h-fit space-y-4 lg:col-span-1 lg:block">
          <h3 className="font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase">
            Document Sections
          </h3>
          <nav className="flex flex-col space-y-3 text-xs font-medium text-neutral-400">
            <a
              href="#philosophy"
              className="transition-colors hover:text-indigo-400"
            >
              1. Core Philosophy
            </a>
            <a
              href="#llm-training"
              className="transition-colors hover:text-indigo-400"
            >
              2. Model Boundaries
            </a>
            <a
              href="#sessions"
              className="transition-colors hover:text-indigo-400"
            >
              3. Authentication
            </a>
            <a
              href="#retention"
              className="transition-colors hover:text-indigo-400"
            >
              4. Database Retention
            </a>
            <a
              href="#compliance"
              className="transition-colors hover:text-indigo-400"
            >
              5. Compliance & Auditing
            </a>
          </nav>
        </div>

        {/* Detailed Sections Column */}
        <div className="space-y-12 lg:col-span-3">
          <div
            id="philosophy"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <Shield className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                1. Core Data Protection Philosophy
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              At WriteFlow AI, we approach data privacy as a core system
              constraint rather than a regulatory checkbox. All data in transit
              is encrypted using transport-layer security (TLS 1.3), and
              database clusters reside behind secure virtual networks.
              Role-Based Access Control (RBAC) boundaries are validated at the
              Edge for every API resource request, preventing cross-tenant
              leaks.
            </p>
          </div>

          <div
            id="llm-training"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <Lock className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                2. Workspace Content & LLM Training Exemptions
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              Your intellectual property is yours alone. Content drafted,
              generated, cached, or saved within your WriteFlow AI workspace is
              strictly private. We enforce a global contract with downstream LLM
              provider APIs ensuring that zero workspace submissions are cached,
              stored, or utilized for foundation model pre-training,
              fine-tuning, or feedback loops.
            </p>
          </div>

          <div
            id="sessions"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <Eye className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                3. Session Authentication & Security Credentials
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              We leverage NextAuth.js for decentralized secure session
              management. When you sign in, authorization is maintained via
              secure, HTTP-only, encrypted JSON Web Tokens (JWT). Your OAuth or
              credentials credentials are never exposed to the client
              application layer, and sensitive database columns containing
              encrypted session identifiers are automatically scrubbed.
            </p>
          </div>

          <div
            id="retention"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                4. Database Retention & Cascading Deletions
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              We use Neon&apos;s serverless Postgres instances to store document
              metadata, folder schemas, and user configurations. In compliance
              with data integrity protocols, if a user requests account
              deletion, a cascading database trigger executes instantly across
              all relational models (User, Session, Account, and Document
              workspaces) to perform a hard wipe of your records.
            </p>
          </div>

          <div
            id="compliance"
            className="space-y-6 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <CheckCircle className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                5. Compliance and Auditing Mandates
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              Our infrastructure is continually audited against industry
              standards. If you are an enterprise customer under SOC 2 Type II
              or HIPAA compliance mandates, we offer customizable Dedicated Host
              nodes and strict Data Processing Addendums (DPA).
            </p>
            <div className="flex items-center justify-between border-t border-neutral-800/60 pt-4 font-mono text-xs text-neutral-500">
              <span>Security Officer: privacy@writeflow.com</span>
              <span>Ref ID: WF-2026-SEC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
