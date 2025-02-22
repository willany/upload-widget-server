import { db } from '@/infra/db';
import { schema } from '@/infra/db/schemas';
import type { Either } from '@/shared/either';
import { makeRight } from '@/shared/either';
import { asc, count, desc, ilike } from 'drizzle-orm';
import { z } from 'zod';

const getUploadsInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
});

type GetUploadsInput = z.input<typeof getUploadsInput>;
type GetUploadsOutput = {
  total: number;
  uploads: {
    id: string;
    name: string;
    remoteKey: string;
    remoteUrl: string;
    createdAt: Date;
  }[];
};

export async function getUploads(
  input: GetUploadsInput
): Promise<Either<never, GetUploadsOutput>> {
  const { searchQuery, sortBy, sortDirection, page, pageSize } =
    getUploadsInput.parse(input);

  const [uploads, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.uploads.id,
        name: schema.uploads.name,
        remoteKey: schema.uploads.remoteKey,
        remoteUrl: schema.uploads.remoteUrl,
        createdAt: schema.uploads.createdAt,
      })
      .from(schema.uploads)
      .where(
        searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
      )
      .orderBy((fields) => {
        if (sortBy && sortDirection === 'asc') {
          return asc(fields[sortBy]);
        }

        if (sortBy && sortDirection === 'desc') {
          return desc(fields[sortBy]);
        }

        return desc(fields.id);
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schema.uploads.id) })
      .from(schema.uploads)
      .where(
        searchQuery ? ilike(schema.uploads.name, `%${searchQuery}%`) : undefined
      ),
  ]);

  return makeRight({ uploads, total });
}
