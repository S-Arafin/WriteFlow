import {
  Terminal,
  Scale,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen space-y-12 bg-neutral-950 px-4 py-16">
      {/* Terms Hero */}
      <div className="container mx-auto max-w-4xl space-y-6 text-center">
        <span className="flex items-center justify-center gap-2 text-xs font-bold tracking-widest text-indigo-500 uppercase">
          <Scale className="h-4 w-4" />
          Regulatory Framework
        </span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-lg">
          Last updated: May 31, 2026. Please read these operating guidelines,
          billing structures, and system limits before provisioning workspaces.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="container mx-auto grid max-w-4xl grid-cols-1 gap-12 text-left lg:grid-cols-4">
        {/* Sticky Sidebar Navigation */}
        <div className="sticky top-24 hidden h-fit space-y-4 lg:col-span-1 lg:block">
          <h3 className="font-mono text-xs font-bold tracking-wider text-neutral-500 uppercase">
            Agreement Map
          </h3>
          <nav className="flex flex-col space-y-3 text-xs font-medium text-neutral-400">
            <a
              href="#acceptance"
              className="transition-colors hover:text-indigo-400"
            >
              1. Acceptance of Terms
            </a>
            <a
              href="#provisioning"
              className="transition-colors hover:text-indigo-400"
            >
              2. Account Provisioning
            </a>
            <a
              href="#acceptable-use"
              className="transition-colors hover:text-indigo-400"
            >
              3. Acceptable Use Policy
            </a>
            <a
              href="#intellectual-property"
              className="transition-colors hover:text-indigo-400"
            >
              4. Intellectual Property
            </a>
            <a
              href="#billing"
              className="transition-colors hover:text-indigo-400"
            >
              5. Billing & Cancellations
            </a>
            <a
              href="#warranties"
              className="transition-colors hover:text-indigo-400"
            >
              6. System Warranties
            </a>
          </nav>
        </div>

        {/* Detailed Content Column */}
        <div className="space-y-12 lg:col-span-3">
          <div
            id="acceptance"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <Scale className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                1. Acceptance of Operating Terms
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              By accessing, deploying, or subscribing to WriteFlow AI &quot;the
              Service&quot;, you agree to be bound by these Terms of Service and
              our associated Privacy Policy. If you are entering into this
              agreement on behalf of an enterprise or organization, you
              represent that you possess the necessary legal authority to bind
              said entity.
            </p>
          </div>

          <div
            id="provisioning"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <Terminal className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                2. Account Provisioning & Roles
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              Users must provide accurate, current, and complete registration
              parameters. You are solely responsible for maintaining the
              confidentiality of your credentials (including NextAuth secure
              cookies and session secrets). We assign administrative boundaries
              using strict Role-Based Access Control (RBAC) schemas; you are
              responsible for any actions executed within your role scope.
            </p>
          </div>

          <div
            id="acceptable-use"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                3. Acceptable Use and Rate Limits
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              WriteFlow AI provides systematic, AI-driven content generation
              pipelines. You agree not to:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-xs text-neutral-400">
              <li>
                Deploy automated scripts, bots, or scrapers to execute
                high-volume, concurrent document updates bypassing default
                application thresholds.
              </li>
              <li>
                Circumvent subscription tier limits or attempt to access
                namespaces without matching RBAC permissions.
              </li>
              <li>
                Inject malware, execute SQL injection payloads, or trigger
                database connection overflows against serverless Neon storage
                modules.
              </li>
            </ul>
          </div>

          <div
            id="intellectual-property"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <CheckCircle className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                4. Intellectual Property & Ownership
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              WriteFlow AI lays zero claim of ownership to the content compiled,
              drafted, or generated by you using our application suite. All
              rights, titles, and intellectual interests in your input texts and
              generated content outputs reside solely with the user. The
              platform&apos;s proprietary codebase, layout architectures, custom
              React Server components, database configurations, and UI design
              assets are the exclusive property of WriteFlow AI.
            </p>
          </div>

          <div
            id="billing"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <HelpCircle className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                5. Billing, Cancellations, and Tier Transitions
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              Paid plans (Pro and Enterprise) are billed on a recurring monthly
              or annual basis. Downgrading or upgrading your workspace
              subscription operates instantly, with billing parameters prorated
              according to payment gateway schemas. Account cancellations take
              effect at the conclusion of the active billing cycle.
            </p>
          </div>

          <div
            id="warranties"
            className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/20 p-8 backdrop-blur"
          >
            <div className="flex items-center space-x-3 text-indigo-400">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-bold tracking-tight text-white">
                6. System Warranties and Liability Boundaries
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
              The Service is provided &quot;as-is&quot; and
              &quot;as-available&quot; without any warranty of any kind, whether
              express or implied. WriteFlow AI does not guarantee that
              downstream LLM endpoints will operate uninterruptedly or that
              database operations will achieve 100% latency thresholds in
              serverless server instances. Under no circumstances shall
              WriteFlow AI be liable for direct, indirect, or incidental data
              loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
