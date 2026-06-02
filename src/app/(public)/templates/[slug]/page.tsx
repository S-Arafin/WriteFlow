import { TemplateCategory } from '@prisma/client';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { type Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

export const revalidate = 86400; // 24-hour cache for individual template detail pages

import { TemplateCard } from '@/components/explore/template-card';
import { ReviewForm } from '@/components/templates/review-form';
import { authOptions } from '@/lib/auth';
import { getRelatedTemplates, getTemplateBySlug } from '@/lib/data/templates';

// ─── Metadata (dynamic) ───────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    return {
      title: 'Template Not Found — WriteFlow AI',
    };
  }

  return {
    title: `${template.title} — WriteFlow AI`,
    description: template.description,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  BLOG: 'Blog & Articles',
  SOCIAL: 'Social Media',
  EMAIL: 'Email Campaigns',
  AD_COPY: 'Ad Copy',
};

function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < Math.round(rating)
                ? 'size-4 fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30 size-4 fill-none'
            }
          />
        ))}
      </div>
      <span className="text-foreground font-semibold">{rating.toFixed(1)}</span>
      <span className="text-muted-foreground text-sm">
        ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
      </span>
    </div>
  );
}

// ─── Page (RSC) ───────────────────────────────────────────────────────────────

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TemplateDetailPage({
  params,
}: TemplateDetailPageProps) {
  const { slug } = await params;

  // Parallel fetches — template detail and session
  const [template, session] = await Promise.all([
    getTemplateBySlug(slug),
    getServerSession(authOptions),
  ]);

  // Return a proper 404 for unknown or unpublished slugs
  if (!template) {
    notFound();
  }

  // Related templates (after template is confirmed to exist)
  const related = await getRelatedTemplates(template.category, slug);

  const approvedReviews = template.reviews;
  const totalReviewCount = template._count.reviews;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* ── Back Navigation ─────────────────────────────────────────────────── */}
      <Link
        href="/explore"
        className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Explore
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* ── Main Column ───────────────────────────────────────────────────── */}
        <div className="space-y-10 lg:col-span-2">
          {/* Thumbnail */}
          {template.thumbnailUrl ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
              <Image
                src={template.thumbnailUrl}
                alt={`${template.title} preview`}
                fill
                sizes="(max-width: 1024px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="via-background flex aspect-video w-full items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/20">
              <BookOpen className="size-20 text-indigo-400/40" />
            </div>
          )}

          {/* Title & Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-indigo-500/20 ring-inset">
                {CATEGORY_LABELS[template.category]}
              </span>
              {template.tone && (
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                  Tone: {template.tone}
                </span>
              )}
            </div>

            <h1 className="text-foreground text-3xl leading-tight font-bold tracking-tight">
              {template.title}
            </h1>

            <StarRating
              rating={template.rating}
              reviewCount={totalReviewCount}
            />

            <p className="text-muted-foreground leading-relaxed">
              {template.description}
            </p>
          </div>

          {/* Sample Output */}
          {template.sampleOutput && (
            <div className="space-y-3">
              <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
                <Sparkles className="size-4 text-indigo-400" />
                Sample Output
              </h2>
              <div className="border-border bg-muted/30 prose prose-sm prose-invert max-w-none rounded-xl border p-6">
                <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap">
                  {template.sampleOutput}
                </pre>
              </div>
            </div>
          )}

          {/* ── Reviews Section ──────────────────────────────────────────── */}
          <div className="space-y-6">
            <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
              <MessageSquare className="size-5 text-indigo-400" />
              Reviews{' '}
              <span className="text-muted-foreground text-base font-normal">
                ({totalReviewCount})
              </span>
            </h2>

            {/* Approved reviews */}
            {approvedReviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No approved reviews yet. Be the first to share your experience.
              </p>
            ) : (
              <div className="space-y-4">
                {approvedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-border bg-card rounded-xl border p-5"
                  >
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative bg-muted flex size-9 items-center justify-center overflow-hidden rounded-full">
                          {review.author.avatarUrl ? (
                            <Image
                              src={review.author.avatarUrl}
                              alt={review.author.name ?? 'Reviewer'}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <User className="text-muted-foreground size-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">
                            {review.author.name ?? 'Anonymous'}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(review.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Star rating for this review */}
                      <div className="flex shrink-0 items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={
                              i < review.rating
                                ? 'size-3.5 fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30 size-3.5 fill-none'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {review.body && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {review.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Review Submission Form ───────────────────────────────── */}
            <div className="border-border rounded-xl border p-6">
              <h3 className="text-foreground mb-5 text-lg font-semibold">
                Leave a Review
              </h3>
              <ReviewForm
                templateId={template.id}
                isAuthenticated={!!session}
              />
            </div>
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────────────────────── */}
        <aside className="space-y-6">
          {/* Stats card */}
          <div className="border-border bg-card rounded-xl border p-6">
            <h2 className="text-foreground mb-5 text-base font-semibold">
              Template Details
            </h2>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <TrendingUp className="size-4" />
                  Total uses
                </dt>
                <dd className="text-foreground text-sm font-medium">
                  {template.usageCount.toLocaleString()}
                </dd>
              </div>

              {template.estimatedWords && (
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Zap className="size-4" />
                    Est. output
                  </dt>
                  <dd className="text-foreground text-sm font-medium">
                    ~{template.estimatedWords.toLocaleString()} words
                  </dd>
                </div>
              )}

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Sparkles className="size-4" />
                  AI Model
                </dt>
                <dd className="text-foreground text-sm font-medium">
                  {template.aiModel}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <MessageSquare className="size-4" />
                  Documents created
                </dt>
                <dd className="text-foreground text-sm font-medium">
                  {template._count.documents.toLocaleString()}
                </dd>
              </div>

              <div className="flex items-center justify-between">
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="size-4" />
                  Published
                </dt>
                <dd className="text-foreground text-sm font-medium">
                  {new Date(template.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>

            {/* CTA */}
            <div className="border-border mt-6 border-t pt-5">
              {session ? (
                <Link
                  href={`/dashboard/editor?templateId=${template.id}`}
                  id="template-use-cta"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  <Sparkles className="size-4" />
                  Use This Template
                </Link>
              ) : (
                <Link
                  href={`/login?callbackUrl=/templates/${slug}`}
                  id="template-signin-cta"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                >
                  Sign in to Use Template
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Related Templates ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-foreground mb-6 text-xl font-bold">
            Related Templates
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
