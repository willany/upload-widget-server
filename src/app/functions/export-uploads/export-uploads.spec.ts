import { makeUpload } from '@/test/factories/make-upload';
import { randomUUID } from 'node:crypto';
import { describe, it } from 'vitest';
import { exportUploads } from './export-uploads';

describe('export uploads', () => {
  it('should be able to export the uploads', async () => {
    const namePattern = randomUUID();

    const upload1 = await makeUpload({ name: `${namePattern}.webp` });
    const upload2 = await makeUpload({ name: `${namePattern}.webp` });
    const upload3 = await makeUpload({ name: `${namePattern}.webp` });
    const upload4 = await makeUpload({ name: `${namePattern}.webp` });
    const upload5 = await makeUpload({ name: `${namePattern}.webp` });

    const sut = await exportUploads({ searchQuery: namePattern });
  });
});
