import { fastifyCors } from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { fastify } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { getUploadsRoute } from './routes/get-uploads';
import { uploadImageRoute } from './routes/upload-image';
import { transformSwaggerSchema } from './transform-swagger-schema';

const server = fastify();
server.setSerializerCompiler(serializerCompiler);
server.setValidatorCompiler(validatorCompiler);

server.register(fastifyCors, {
  origin: '*',
});
server.register(fastifyMultipart);
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Server',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
});
server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    });
  }

  // send error to an external tool like Sentry, datadog, etc
  console.log(error);
  return reply.status(500).send({
    message: 'Internal server error',
  });
});

server.register(uploadImageRoute);
server.register(getUploadsRoute);

server.get('/', () => {
  return 'Hello World';
});

server.listen({ port: 3333, host: '0.0.0.0' });
