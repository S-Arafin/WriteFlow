import { Prisma, TemplateCategory } from '@prisma/client';

import prisma from '@/lib/prisma';

// ─── Parameter & Return Types ────────────────────────────────────────────────

export type TemplateSortKey = 'rating' | 'usageCount' | 'createdAt';

export interface GetTemplatesParams {
  /** Full-text search against title and description */
  q?: string;
  /** Filter by a single template category enum value */
  category?: TemplateCategory;
  /** Minimum average rating, inclusive (0–5) */
  minRating?: number;
  /** Column to sort results by */
  sort?: TemplateSortKey;
  /** 1-indexed page number */
  page?: number;
  /** Records per page */
  limit?: number;
}

export type TemplateListItem = Prisma.TemplateGetPayload<{
  select: {
    id: true;
    slug: true;
    title: true;
    description: true;
    thumbnailUrl: true;
    category: true;
    tone: true;
    estimatedWords: true;
    rating: true;
    usageCount: true;
    aiModel: true;
    createdAt: true;
    _count: { select: { reviews: true } };
  };
}>;

export interface GetTemplatesResult {
  templates: TemplateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Data Fetching Function ───────────────────────────────────────────────────

export async function getTemplates(
  params: GetTemplatesParams = {}
): Promise<GetTemplatesResult> {
  const {
    q,
    category,
    minRating,
    sort = 'rating',
    page = 1,
    limit = 12,
  } = params;

  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 48); // hard cap at 48
  const skip = (safePage - 1) * safeLimit;

  // Build the shared WHERE clause used by both findMany and count
  const where: Prisma.TemplateWhereInput = {
    isPublished: true,
    ...(category && { category }),
    ...(minRating !== undefined &&
      minRating > 0 && { rating: { gte: minRating } }),
    ...(q &&
      q.trim().length > 0 && {
        OR: [
          { title: { contains: q.trim(), mode: 'insensitive' } },
          { description: { contains: q.trim(), mode: 'insensitive' } },
        ],
      }),
  };

  const orderBy: Prisma.TemplateOrderByWithRelationInput = {
    [sort]: 'desc',
  };

  const select = {
    id: true,
    slug: true,
    title: true,
    description: true,
    thumbnailUrl: true,
    category: true,
    tone: true,
    estimatedWords: true,
    rating: true,
    usageCount: true,
    aiModel: true,
    createdAt: true,
    _count: { select: { reviews: true } },
  } satisfies Prisma.TemplateSelect;

  // Run findMany and count concurrently. $transaction([...]) requires a
  // dedicated connection (BEGIN/COMMIT) which times out under the PrismaPg
  // pool adapter. Promise.all is correct here — these are read-only queries
  // with no cross-query write visibility requirements.
  const [templates, total] = await Promise.all([
    prisma.template.findMany({ where, orderBy, skip, take: safeLimit, select }),
    prisma.template.count({ where }),
  ]);

  return {
    templates,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

// ─── Single Template Fetch ────────────────────────────────────────────────────

export type TemplateDetail = Prisma.TemplateGetPayload<{
  include: {
    reviews: {
      where: { status: 'APPROVED' };
      include: {
        author: { select: { id: true; name: true; avatarUrl: true } };
      };
      orderBy: { createdAt: 'desc' };
      take: 20;
    };
    _count: { select: { reviews: true; documents: true } };
  };
}>;

export async function getTemplateBySlug(
  slug: string
): Promise<TemplateDetail | null> {
  return prisma.template.findUnique({
    where: { slug, isPublished: true },
    include: {
      reviews: {
        where: { status: 'APPROVED' },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { reviews: true, documents: true } },
    },
  });
}

export async function getRelatedTemplates(
  category: TemplateCategory,
  excludeSlug: string,
  limit = 4
): Promise<TemplateListItem[]> {
  return prisma.template.findMany({
    where: {
      isPublished: true,
      category,
      slug: { not: excludeSlug },
    },
    orderBy: { rating: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      thumbnailUrl: true,
      category: true,
      tone: true,
      estimatedWords: true,
      rating: true,
      usageCount: true,
      aiModel: true,
      createdAt: true,
      _count: { select: { reviews: true } },
    },
  });
}
