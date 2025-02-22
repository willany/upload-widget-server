import { db } from '@/infra/db';
import { schema } from '@/infra/db/schemas';
import { isLeft, isRight, unwrapEither } from '@/shared/either';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { InvalidFileFormatError } from '../errors/invalid-file-format';
import { uploadImage } from './upload-image';

describe('upload image', () => {
  beforeAll(() => {
    vi.mock('@/infra/storage/upload-file-to-storage', () => ({
      uploadFileToStorage: vi.fn().mockImplementation(() => ({
        key: `${randomUUID()}-test.jpg`,
        url: `https://test.com/${randomUUID()}-test.jpg`,
      })),
    }));
  });

  it('should be able to upload an image', async () => {
    const filename = `${randomUUID()}-test.jpg`;
    const result = await uploadImage({
      filename,
      contentType: 'image/jpeg',
      contentStream: Readable.from([]),
    });

    expect(isRight(result)).toBe(true);

    const data = await db
      .select()
      .from(schema.uploads)
      .where(eq(schema.uploads.name, filename));

    expect(data).toHaveLength(1);
  });

  it('should not be able to upload an invalid file', async () => {
    const filename = `${randomUUID()}.pdf`;
    const result = await uploadImage({
      filename,
      contentType: 'document/pdf',
      contentStream: Readable.from([]),
    });

    expect(isLeft(result)).toBe(true);
    expect(unwrapEither(result)).toBeInstanceOf(InvalidFileFormatError);
  });
});
