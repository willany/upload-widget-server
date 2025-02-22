import { db } from '@/infra/db';
import { schema } from '@/infra/db/schemas';
import { uploadFileToStorage } from '@/infra/storage/upload-file-to-storage';
import { type Either, makeLeft, makeRight } from '@/shared/either';
import { Readable } from 'node:stream';
import { z } from 'zod';
import { InvalidFileFormatError } from '../errors/invalid-file-format';

const uploadImageInput = z.object({
  filename: z.string(),
  contentType: z.string(),
  contentStream: z.instanceof(Readable),
});

type UploadImageInput = z.input<typeof uploadImageInput>;

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

export async function uploadImage(
  input: UploadImageInput
): Promise<Either<InvalidFileFormatError, { url: string }>> {
  const { filename, contentType, contentStream } =
    uploadImageInput.parse(input);

  if (!allowedMimeTypes.includes(contentType)) {
    return makeLeft(new InvalidFileFormatError());
  }

  const { key, url } = await uploadFileToStorage({
    folder: 'images',
    fileName: filename,
    contentType: contentType,
    contentStream: contentStream,
  });

  console.log('key', key);
  console.log('url', url);
  console.log('filename', filename);

  await db.insert(schema.uploads).values({
    name: filename,
    remoteKey: key,
    remoteUrl: url,
  });

  return makeRight({ url: url });
}
