import { fastifyCors } from '@fastify/cors';
import { fastify } from 'fastify';

const app = fastify();

app.register(fastifyCors, {
  origin: '*',
});

app.get('/', () => {
  return 'Hello World';
});

app.listen({ port: 3333, host: '0.0.0.0' });
