import {
  server as WebSocketServer,
  request as IRequest,
  Message as IMessage,
  connection as IConnection,
} from 'websocket';
import http from 'http';
import config, { Config } from './modules/config.js';
import initMongo, { DB } from '../../shared/database/index.js';
import { speechToText } from '../../shared/modules/gstt.js';
import UserService from '../../shared/database/services/user.js';
import { User } from '../../shared/ts/mongo.js';
import InquirerClient from '../../shared/classes/inquirerClient.js';

export class WSClient extends InquirerClient {
  private c: Config;
  private db: DB;
  private http = http.createServer();
  private server = new WebSocketServer({
    httpServer: this.http,
    autoAcceptConnections: false,
  });

  constructor() {
    const c = config();
    super(c.redisConfig, false);
    this.c = c;
    void this.start();
  }

  private async start() {
    this.db = await initMongo(this.c.mongoConfig, this.c.mongoDb);
    this.handleConnection();
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
    if (message.type === 'utf8') {
      const payload = JSON.parse(message.utf8Data);
      this.handleMessage(payload, conn, user);
    } else if (message.type === 'binary') {
      this.handleVoiceBuffer(message.binaryData, conn, user);
    }
  }

  private handleMessage(payload: [string, any], conn: IConnection, user: User) {
    const eventName = payload[0];
    const eventData = payload[1];
    void eventData, conn, user;
    switch (eventName) {
      default:
        break;
    }
  }

  private async handleVoiceBuffer(
    buffer: Buffer,
    conn: IConnection,
    user: User,
  ) {
    void conn;

    try {
      if (buffer.byteLength > 8000 && buffer.byteLength < 200 * 1000) {
        console.time('speechToText');
        // Speech to text
        const text = await speechToText(
          this.c.googleBucketName,
          buffer,
          user.appSettings.lang,
        );
        console.timeEnd('speechToText');

        console.time('getYCResult');
        const result = await this.getYCResult({
          text,
          user,
          opts: {
            ttsEnabled: user.appSettings?.tts?.enabled,
            ttsVoice: user.appSettings?.tts?.voice,
          },
        });
        console.timeEnd('getYCResult');

        if (!result.result && result.cmds)
          conn.sendUTF(JSON.stringify(['cmd', result.cmds]));
        else conn.sendUTF(JSON.stringify(['voicing_payload', result]));
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
