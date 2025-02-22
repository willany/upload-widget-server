import { uploadImage } from '@/app/functions';
import { isRight, unwrapEither } from '@/shared/either';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

export const uploadImageRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/uploads',
    {
      schema: {
        summary: 'Upload image',
        tags: ['uploads'],
        consumes: ['multipart/form-data'],
        response: {
          201: z.null().describe('Upload successful'),
          400: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const uploadedFile = await request.file({
        limits: {
          fileSize: 1024 * 1024 * 2, //2MB
        },
      });

      if (!uploadedFile) {
        return reply.status(400).send({ message: 'File is required' });
      }

      const result = await uploadImage({
        filename: uploadedFile.filename,
        contentType: uploadedFile.mimetype,
        contentStream: uploadedFile.file,
      });

      if (uploadedFile.file.truncated) {
        return reply.status(400).send({ message: 'File is too large' });
      }

      if (isRight(result)) {
        return reply.status(201).send();
      }
      const error = unwrapEither(result);

      switch (error.constructor.name) {
        case 'InvalidFileFormatError':
          return reply.status(400).send({ message: error.message });
        default:
          return reply.status(500).send({ message: 'Internal server error' });
      }
    }
  );
};
