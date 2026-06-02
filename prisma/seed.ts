import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Clear existing data
  await prisma.user.deleteMany({});

  // Clear existing templates
  await prisma.template.deleteMany({});

  // Seed SiteConfig singleton
  await prisma.siteConfig.deleteMany({});
  await prisma.siteConfig.create({
    data: {
      id: 'singleton',
      maintenanceMode: false,
      aiEnabled: true,
    },
  });

  // Seed Admin
  await prisma.user.create({
    data: {
      email: 'admin@writeflow.com',
      name: 'Admin User',
      role: 'ADMIN',
      plan: 'TEAM',
      hashedPassword,
    },
  });

  // Seed Standard User
  await prisma.user.create({
    data: {
      email: 'user@writeflow.com',
      name: 'Standard User',
      role: 'USER',
      plan: 'FREE',
      hashedPassword,
    },
  });

  // Seed Templates
  await prisma.template.createMany({
    data: [
      {
        slug: 'seo-blog-writer',
        title: 'SEO Blog Post Outliner & Draft Engine',
        description:
          'Generate high-ranking, outline-structured blog posts optimized with target keywords and logical reading sections.',
        prompt:
          'Write a comprehensive, SEO-optimized blog post about the topic: {topic}. Target keywords: {keywords}. Ensure rich formatting and structural markdown.',
        sampleOutput:
          '# How to Maximize SaaS Productivity\n\nProductivity is the engine of high-performance SaaS environments...',
        category: 'BLOG',
        tone: 'Professional & Informative',
        estimatedWords: 1500,
        aiModel: 'gemini-2.5-flash',
        rating: 4.8,
        isPublished: true,
        usageCount: 1420,
      },
      {
        slug: 'linkedin-viral-hook',
        title: 'Viral LinkedIn Post Generator',
        description:
          'Craft high-engagement LinkedIn updates featuring catchy hooks, line breaks, emojis, and persuasive call-to-actions.',
        prompt:
          'Create a highly engaging LinkedIn post based on this story or idea: {idea}. Use clean spacing, bold hooks, and relevant industry hashtags.',
        sampleOutput:
          "🚀 SaaS founders are making this one critical mistake...\n\nMost think scaling requires hiring more developers. It doesn't.",
        category: 'SOCIAL',
        tone: 'Persuasive & Enthusiastic',
        estimatedWords: 300,
        aiModel: 'gemini-2.5-flash',
        rating: 4.9,
        isPublished: true,
        usageCount: 2850,
      },
      {
        slug: 'saas-product-launch',
        title: 'High-Converting Product Launch Email',
        description:
          'Generate sequence openers for new product releases built with compelling value props and highly focused action prompts.',
        prompt:
          'Write a product launch email for: {product_name}. Highlight features: {features}. End with a clear call-to-action link.',
        sampleOutput:
          'Subject: Meet WriteFlow AI: The Future of Copywriting\n\nHey there,\n\nWe are thrilled to introduce...',
        category: 'EMAIL',
        tone: 'Exciting & Direct',
        estimatedWords: 250,
        aiModel: 'gemini-2.5-flash',
        rating: 4.7,
        isPublished: true,
        usageCount: 920,
      },
      {
        slug: 'facebook-ad-copywriter',
        title: 'AIDA-Structured Facebook Ad Copy',
        description:
          'Produce high-CTR direct response Facebook ad descriptions structured on the Attention, Interest, Desire, Action framework.',
        prompt:
          'Write a compelling Facebook ad copy following the AIDA format for: {product_or_service}. Offer: {offer}.',
        sampleOutput:
          '🔥 ATTENTION SaaS Founders!\n\nAre you struggling to draft engaging updates?\n\nMeet WriteFlow AI...',
        category: 'AD_COPY',
        tone: 'Persuasive & Direct',
        estimatedWords: 180,
        aiModel: 'gemini-2.5-flash',
        rating: 4.6,
        isPublished: true,
        usageCount: 1840,
      },
    ],
  });

  console.log(
    'Seeding complete: admin, user, and 4 premium templates successfully created.'
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
