import type {HTTPClient} from "../../index.js";
import fastifyOpenapiDocs from "@fastify/swagger";
import fastifySwagger from "@fastify/swagger-ui";

export default async function registerOpenAPI(this: HTTPClient) {
  await this.router.register(fastifyOpenapiDocs, {
    swagger: {
      info: {
        title: 'Ettie HTTP API',
        description: 'HTTP API for Ettie',
        version: '0.1.0'
      },
      // externalDocs: {
      //   url: 'https://swagger.io',
      //   description: 'Find more info here'
      // },
      host: 'localhost:3000',
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        // { name: 'user', description: 'User related end-points' },
        // { name: 'code', description: 'Code related end-points' }
      ],
      // definitions: {
      //   User: {
      //     type: 'object',
      //     required: ['id', 'email'],
      //     properties: {
      //       id: { type: 'string', format: 'uuid' },
      //       firstName: { type: 'string' },
      //       lastName: { type: 'string' },
      //       email: {type: 'string', format: 'email' }
      //     }
      //   }
      // },
      securityDefinitions: {
        // apiKey: {
        //   type: 'apiKey',
        //   name: 'apiKey',
        //   in: 'header'
        // }
      }
    }
  });
  await this.router.register(fastifySwagger, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: false,
    transformSpecificationClone: true
  })
}
