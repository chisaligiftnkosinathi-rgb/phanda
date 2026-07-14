module.exports = {
  iphande: {
    input: './openapi_updated.json',
    output: {
      mode: 'split',
      target: 'src/generated/api.ts',
      schemas: 'src/generated/models',
      client: 'react-query',
      mock: false,
      override: {
        mutator: {
          path: 'src/shared/api/client.ts',
          name: 'customInstance',
        },
      },
    },
  },
};
