import type { HTTPClient } from '../../index.js';
import { YouChatReqPayload } from '../../../../shared/ts/inq.js';
import verifyToken from '../../modules/auth.js';
import { User } from '../../../../shared/ts/mongo.js';

interface IHeaders {
  user: User;
  'x-token': string;
}

export async function ycReq(this: HTTPClient) {
  const self = this;

  this.router.route<{ Querystring: YouChatReqPayload; Headers: IHeaders }>({
    method: 'GET',
    url: '/api/yc.q',
    schema: {
      description: 'Make request to YouChat',
      querystring: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', description: 'Question text' },
          history: {
            type: 'array',
            description: 'Dialog history',
            default: [],
          },
          chatId: { type: 'string', description: 'Chat ID', format: 'uuid' },
          searchResCount: {
            type: 'number',
            description: 'Search results count',
            minimum: 0,
            maximum: 5,
            default: 3,
          },
          safeSearch: {
            type: 'boolean',
            description: 'Safe search enabled',
            default: false,
          },
        },
      },
      headers: {
        type: 'object',
        required: ['x-token'],
        properties: {
          'x-token': { type: 'string', description: 'User token' },
        },
      },
      // response: {
      //   200: {}
      // }
    },
    preHandler: this.router.auth([verifyToken.bind(self)]),
    async handler(request, reply) {
      const payload = request.query;
      const { user } = request.headers;
      console.log(user);
      const res = await self.getYCResult({ ...payload, ...user });
      reply.send({ result: res });
    },
  });
}
