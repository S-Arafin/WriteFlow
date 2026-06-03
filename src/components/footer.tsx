import { MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border text-muted-foreground border-t bg-neutral-900/10 py-12 text-sm md:py-16 dark:bg-neutral-950/20">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-5">
        {/* Brand Column */}
        <div className="col-span-2 flex flex-col space-y-4">
          <Link
            href="/"
            className="text-foreground text-lg font-bold tracking-tight"
          >
            WriteFlow <span className="text-indigo-500">AI</span>
          </Link>
          <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
            WriteFlow AI is an industry-grade SaaS content workspace designed
            for teams and professionals who rely on disciplined execution and
            advanced AI to scale content production.
          </p>
          {/* Social Icons */}
          <div className="flex space-x-4 pt-2">
            <a
              href="https://github.com/S-Arafin"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <svg
                className="h-4 w-4 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/sultanul-arafin/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <svg
                className="h-4 w-4 fill-current"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="flex flex-col space-y-3">
          <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Workspace
          </span>
          <Link
            href="/login"
            className="hover:text-foreground transition-colors"
          >
            AI Drafting
          </Link>
          <Link
            href="/login"
            className="hover:text-foreground transition-colors"
          >
            Tone Editor
          </Link>
          <Link
            href="/login"
            className="hover:text-foreground transition-colors"
          >
            Team Assets
          </Link>
          <Link
            href="/blog"
            className="hover:text-foreground transition-colors"
          >
            Writing Guides
          </Link>
        </div>

        <div className="flex flex-col space-y-3">
          <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Company
          </span>
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/blog"
            className="hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="hover:text-foreground transition-colors"
          >
            Contact
          </Link>
          <Link
            href="/about"
            className="hover:text-foreground transition-colors"
          >
            Careers
          </Link>
        </div>

        <div className="flex flex-col space-y-3">
          <span className="text-foreground text-xs font-semibold tracking-wider uppercase">
            Legal
          </span>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Security Rules
          </Link>
        </div>
      </div>

      {/* Under-Footer */}
      <div className="border-border/40 container mx-auto mt-12 flex flex-col items-center justify-between gap-4 border-t px-4 pt-8 text-xs md:flex-row">
        <p>
          © {currentYear} WriteFlow AI. All rights reserved. Created in local
          sandbox.
        </p>
        <div className="flex space-x-6">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> Silicon Valley, CA
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" /> +8801979817736
          </span>
        </div>
      </div>
    </footer>
  );
}
