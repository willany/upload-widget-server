import { jsonSchemaTransform } from 'fastify-type-provider-zod';

type TransformSwaggerSchemaData = Parameters<typeof jsonSchemaTransform>[0];

export function transformSwaggerSchema(data: TransformSwaggerSchemaData) {
  const { schema, url } = jsonSchemaTransform(data);

  if (schema.consumes?.includes('multipart/form-data')) {
    if (schema.body === undefined) {
      schema.body = {
        type: 'object',
        properties: {},
        required: [],
      };
    }

    schema.body.properties.file = {
      type: 'string',
      format: 'binary',
    };

    schema.body.required.push('file');
  }

  return {
    schema,
    url,
  };
}
