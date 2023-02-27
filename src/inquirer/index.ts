// import { Redis } from 'ioredis';
import Queue from 'bee-queue';
import config from './modules/config.js';
import YCClient from './modules/ycClient/index.js';
import {
  InquirerReqResponse,
  youChatReqPayload,
  YouChatReqPayload,
} from '../shared/ts/inq.js';
import getYCApiUrl from './utils/getYCurlString.js';
import { AliceClient } from './packages/index.js';
import parseCommand from '../shared/modules/parse-cmd.js';
import beautifyRequestText from './utils/beautifyRequestText.js';
import beautifyResponseText from './utils/beautifyResponseText.js';
import parseApps from '../shared/modules/parse-apps/index.js';
import { translateGT } from '../shared/modules/gt.js';

export default class Inquirer {
  private c = config();
  private queue = new Queue('inq:yc', {
    redis: this.c.redisConfig,
    isWorker: true,
  });
  private ycClient = new YCClient(this.c);
  private alice = new AliceClient({
    log: true,
  });

  constructor() {
    void this.start();
  }

  private async start() {
    await this.ycClient.initBrowser();
    this.alice.connect();
    console.log('alice connect');
    this.initResolvers();
  }

  initResolvers(): void {
    const self = this;

    // Subscribe for requests
    this.queue.process(
      1,
      function (
        job: Queue.Job<YouChatReqPayload>,
        done: Queue.DoneCallback<InquirerReqResponse>,
      ) {
        console.log(`Processing job ${job.id}`);
        self
          .onMessage(job.data)
          .then((res) => done(null, res))
          .catch((e) => {
            console.error(e);
            done(e);
          });
      },
    );
  }

  async onMessage($payload: YouChatReqPayload): Promise<InquirerReqResponse> {
    const payload = youChatReqPayload.parse($payload);
    const { user } = payload;
    const userLang = user.appSettings?.lang?.split('-')[0] ?? 'en';

    payload.text = beautifyRequestText(payload.text);

    console.log(userLang);

    const response: Partial<InquirerReqResponse> = {
      result: null,
    };

    // Translate question
    console.time('translatePayload');
    const payloadEng = await translateGT(payload.text, 'en', userLang);
    // const payloadEng = await this.translate.translate(
    //   payload.text,
    //   userLang,
    //   'en',
    // );
    console.timeEnd('translatePayload');

    // Check if it's a command
    const cmds = await parseCommand(payloadEng.text);
    if (cmds && !cmds.fetch) {
      response.cmds = cmds;
      return response;
    }

    // Retreive response from YouChat
    console.time('getEventSource');
    const result =
      cmds && cmds.type === 'find-trigger'
        ? await this.ycClient.getEventSourceParam(
            getYCApiUrl({ ...payload, text: cmds.act }),
            'youChatSerpResults',
          )
        : await this.ycClient.getEventSource(
            getYCApiUrl({ ...payload, text: payloadEng.text }),
          );
    console.timeEnd('getEventSource');

    const apps = await parseApps(result);
    if (apps) response.result = { ...result, ...apps };
    else response.result = result;

    // Translate question
    let payloadSrc: {
      from: string;
      to: string;
      text: string;
    };

    if (response.result.text) {
      console.time('translateResponse');
      payloadSrc = await translateGT(
        beautifyResponseText(response.result.text),
        userLang,
        'en',
      );
      console.timeEnd('translateResponse');
      response.result.text = payloadSrc.text;
    }

    response.result.query = payload.text;
    if (cmds && cmds.fetch === true) response.cmds = cmds;

    console.time('voice');
    if (payloadSrc && payload.opts.ttsEnabled && !cmds?.fetch) {
      response.voice = (
        await this.alice.tts(payloadSrc.text, {
          voice: payload.opts.ttsVoice,
        })
      ).audioData;
    }
    console.timeEnd('voice');

    return response;
  }
}
