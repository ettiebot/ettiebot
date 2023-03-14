import beautifyRequestText from '../../../inquirer/utils/beautifyRequestText.js';
import capiReq from '../../../shared/modules/chatapi.js';
import { speechToText } from '../../../shared/modules/gstt.js';
import parseCommand from '../../../shared/modules/parse-cmd.js';
import { User } from '../../../shared/ts/mongo.js';
import { InquirerReqResponse } from '../../../shared/ts/req.js';
import stringToUUID from '../../../shared/utils/stringToUUID.js';
import type { HTTPClient } from '../index.js';
import verifyToken from '../middleware/verifyToken.js';

interface IHeaders {
  user: User;
  'x-token': string;
}

export default function (this: HTTPClient) {
  const self = this;

  this.router.route<{ Headers: IHeaders }>({
    method: 'POST',
    url: '/api/voice',
    schema: {
      headers: {
        type: 'object',
        required: ['x-token'],
        properties: {
          'x-token': { type: 'string', description: 'API key' },
        },
      },
    },
    preHandler: this.router.auth([verifyToken.bind(this)]),
    async handler(request) {
      const user = request.headers.user;
      const data = await request.file();
      const buffer = await data.toBuffer();

      if (buffer.byteLength < 8000 || buffer.byteLength > 200 * 1000)
        throw new Error('Buffer size is not valid');
      if (data.mimetype !== 'audio/ogg')
        throw new Error('File type is not valid');

      // Speech-to-text
      const query = beautifyRequestText(
        await speechToText(
          self.c.googleBucketName,
          buffer,
          user.appSettings.lang,
        ),
      );

      const payload = {
        query: {
          text: query,
          from: user.appSettings.lang,
          to: 'en',
        },
        command: null,
      };

      const response: Partial<InquirerReqResponse> = {
        result: null,
      };

      // Translate query to english
      if (user.appSettings.lang !== 'en') {
        payload.query = await self.yt.translate(
          payload.query.text,
          user.appSettings.lang,
          'en',
        );
      }

      // Fetch commands in query
      try {
        payload.command = await parseCommand(payload.query.text);
      } catch (_) {
        //
      }

      if (payload.command && payload.command?.intentName === 'findInApp') {
        const appName = payload.command.parameters.appName?.stringValue;
        const searchQuery = payload.command.parameters.searchQuery?.stringValue;

        if (appName && searchQuery) {
          response.result = await capiReq(
            `${self.c.chatAPIURL}/appData`,
            {
              text: searchQuery,
              appName,
            },
            self.c.chatAPIKey,
          );
        }
      }

      if (
        payload.command?.parameters?.needData?.stringValue !== 'false' &&
        !response.result
      ) {
        // Request
        response.result = await capiReq(
          `${self.c.chatAPIURL}/query`,
          {
            text: payload.query.text,
            chatId: stringToUUID(user._id.toString()),
          },
          self.c.chatAPIKey,
        );
      }

      if (payload.command) {
        return { ...payload.command, ...(response.result ?? {}) };
      } else {
        // Translate response to query language
        if (user.appSettings.lang !== 'en') {
          response.result.query = query;
          response.result.text = (
            await self.yt.translate(
              response.result.text,
              'en',
              user.appSettings.lang,
            )
          ).text;
        }

        return response;
      }
    },
  });

  this.router.route<{ Headers: IHeaders }>({
    method: 'POST',
    url: '/api/synth',
    schema: {
      headers: {
        type: 'object',
        required: ['x-token'],
        properties: {
          'x-token': { type: 'string', description: 'API key' },
        },
      },
    },
    preHandler: this.router.auth([verifyToken.bind(this)]),
    async handler(request) {
      // const user = request.headers.user;
      const data = request.body['t'];
      const text = Buffer.from(data, 'base64').toString('utf-8');

      const res = await self.alice.tts(text);
      return { s: res.audioData.toString('base64') };
    },
  });
}
