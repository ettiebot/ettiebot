import BeeQueue from 'bee-queue';
import { InquirerReqResponse, YouChatReqPayload } from '../ts/inq.js';

/**
 * Client for communicating with inquirers
 */
export default class InquirerClient {
  public ycQueue: BeeQueue;

  constructor(redisURL: string, isInquirer: boolean) {
    this.ycQueue = new BeeQueue('inq:yc', {
      redis: redisURL,
      isWorker: isInquirer,
    });
  }

  public async getYCResult(
    payload: YouChatReqPayload,
  ): Promise<InquirerReqResponse> {
    const self = this;
    return await new Promise((resolve, reject) => {
      self.ycQueue
        .createJob(payload)
        .retries(2)
        .save()
        .then((job) => {
          job.on('succeeded', resolve);
          job.on('failed', reject);
        });
    });
  }
}
