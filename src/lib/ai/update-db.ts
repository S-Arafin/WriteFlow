import dotenv from 'dotenv';
dotenv.config();

import prisma from '../prisma';

async function main() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('Updating templates in database to use Gemini...');
  const result = await prisma.template.updateMany({
    where: {
      aiModel: {
        in: ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet'],
      },
    },
    data: {
      aiModel: 'gemini-2.5-flash',
    },
  });
  console.log(
    `Successfully updated ${result.count} template records to gemini-2.5-flash!`
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
