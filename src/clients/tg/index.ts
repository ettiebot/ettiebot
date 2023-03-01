// import { Redis } from 'ioredis';
import Queue from 'bee-queue';
import { YouChatReqPayload, YouChatReqResponse } from '../../shared/ts/inq.js';
import config from './modules/config.js';

export class TGClient {
  private c = config();
  // private redis = new Redis(this.c.redisConfig);
  private queue = new Queue('inq:yc', {
    redis: this.c.redisConfig,
    isWorker: false,
  });

  constructor() {
    setInterval(async () => {
      console.log(await this.reqYC({ text: 'hi' }));
    }, 6000);
  }

  async reqYC(payload: YouChatReqPayload): Promise<YouChatReqResponse> {
    return await new Promise((resolve, reject) => {
      this.queue
        .createJob(payload)
        .save()
        .then((job) => {
          job.on('succeeded', resolve);
          job.on('failed', reject);
        });
    });
  }
}
