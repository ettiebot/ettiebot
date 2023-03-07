import {
  server as WebSocketServer,
  request as IRequest,
  Message as IMessage,
  connection as IConnection,
} from 'websocket';
import http from 'http';
import config from './modules/config.js';
import initMongo, { DB } from '../../shared/database/index.js';
import UserService from '../../shared/database/services/user.js';
import { User } from '../../shared/ts/mongo.js';
import { speechToText } from '../../shared/modules/gstt.js';
import axios from 'axios';
import stringToUUID from '../../shared/utils/stringToUUID.js';
import { YouChatResponse } from '../../shared/ts/youchat.js';
import beautifyRequestText from '../../inquirer/utils/beautifyRequestText.js';
import { InquirerReqResponse } from '../../shared/ts/req.js';
import { translateGT } from '../../shared/modules/gt.js';
import parseCommand from '../../shared/modules/parse-cmd.js';
import beautifyResponseText from '../../inquirer/utils/beautifyResponseText.js';
import { AliceClient } from '../../shared/packages/index.js';

export class WSClient {
  private c = config();
  private db: DB;
  private http = http.createServer();
  private alice = new AliceClient({
    log: true,
  });
  private server = new WebSocketServer({
    httpServer: this.http,
    autoAcceptConnections: false,
  });

  constructor() {
    void this.start();
  }

  private async start() {
    this.db = await initMongo(this.c.mongoConfig, this.c.mongoDb);
    this.handleConnection();
    this.alice.connect();
    await this.startServer();
  }

  private handleConnection() {
    const self = this;

    this.server.on('request', async function (request) {
      try {
        // Check if user is authorized
        const user = await self.getUser(request);
        if (!user) return;

        // Accept connection
        const conn = request.accept('echo-protocol', request.origin);

        // Send user data to client
        conn.send(JSON.stringify(['auth', user]));

        conn.on('message', (msg) => self.onMessage(msg, conn, user));
        conn.on('close', () => self.onClose(conn));
      } catch (e) {
        console.error(e);
        request.reject();
      }
    });
  }

  private onMessage(message: IMessage, conn: IConnection, user: User) {
    if (message.type === 'binary') {
      this.handleVoiceBuffer(message.binaryData, conn, user);
    }
  }

  private async handleVoiceBuffer(
    buffer: Buffer,
    conn: IConnection,
    user: User,
  ) {
    const userLang = user.appSettings.lang ?? 'en';
    console.log(userLang);

    const response: Partial<InquirerReqResponse> = {
      result: null,
    };

    try {
      if (buffer.byteLength > 8000 && buffer.byteLength < 200 * 1000) {
        // STT
        console.time('speechToText');
        const text = beautifyRequestText(
          await speechToText(
            this.c.googleBucketName,
            buffer,
            user.appSettings.lang,
          ),
        );
        console.timeEnd('speechToText');

        // Translate question
        console.time('translatePayload');
        const payloadEng =
          userLang !== 'en'
            ? await translateGT(text, 'en', userLang)
            : { text };
        console.timeEnd('translatePayload');

        // Checkout commands
        const cmds = await parseCommand(payloadEng.text);
        if (cmds && !cmds.fetch) {
          response.cmds = cmds;
          return conn.sendUTF(JSON.stringify(['cmd', cmds]));
        }

        // Request
        console.time('getYCResult');
        response.result = (
          await axios.get<{ result: YouChatResponse }>(
            `${this.c.chatAPIURL}/query`,
            {
              params: {
                text: payloadEng.text,
                chatId: stringToUUID(user._id.toString()),
                getParam: cmds && cmds.fetch ? 'youChatSerpResults' : null,
              },
              headers: {
                'x-token': this.c.chatAPIKey,
              },
            },
          )
        ).data.result;
        console.timeEnd('getYCResult');

        if (cmds && cmds.fetch) {
          response.cmds = cmds;
        } else {
          // Translate response
          console.time('translateResponse');
          const payloadSrc =
            userLang !== 'en'
              ? await translateGT(
                  beautifyResponseText(response.result.text),
                  userLang,
                  'en',
                )
              : { text: beautifyResponseText(response.result.text) };
          console.timeEnd('translateResponse');
          response.result.text = payloadSrc.text;

          // TTS
          if (!user.appSettings?.tts || user.appSettings?.tts?.enabled) {
            console.time('voice');
            this.alice
              .tts(payloadSrc.text, {
                voice: user.appSettings?.tts?.voice ?? 'shitova.us',
              })
              .then(({ audioData }) => {
                conn.sendBytes(audioData);
                console.timeEnd('voice');
              });
          }
        }

        // Send response
        conn.sendUTF(JSON.stringify(['response', response]));
      } else {
        throw 'no_results';
      }
    } catch (errCode) {
      if (typeof errCode === 'string') {
        conn.sendUTF(JSON.stringify(['error', errCode]));
      } else {
        console.error(errCode);
        conn.sendUTF(JSON.stringify(['error', 'unknown']));
      }
    }
  }

  private async getUser(request: IRequest): Promise<User> {
    // TODO: check origin
    const { query } = request.resourceURL;
    const token = query['uid'] as string;
    const lang = (query['lang'] as string) ?? undefined;
    const useTranslate = (query['useTranslate'] as boolean) ?? 'true';
    const useHistory = (query['useHistory'] as boolean) ?? 'true';
    if (!token) throw new Error('Token mismatch');
    return await UserService.getByToken(this.db, token, {
      lang,
      useTranslate: Boolean(useTranslate),
      useHistory: Boolean(useHistory),
    });
  }

  private async startServer() {
    const self = this;
    this.http.listen(this.c.port, function () {
      console.log(new Date() + ' Server is listening on port ' + self.c.port);
    });
  }

  private onClose(connection: IConnection) {
    console.info('connection closed', connection.state);
  }
}
