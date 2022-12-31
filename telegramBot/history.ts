import Redis from "ioredis";
import { MessagesHistoryItem } from "../shared/types";

export default class History {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async push(key: string, payload: MessagesHistoryItem) {
    let data = [];
    try {
      data = JSON.parse(await this.redis.get("history/" + key));
      if (data.length > 50) data = data.splice(0, data.length - 1);
      data.push(payload);
    } catch (e) {
      data = [payload];
    }

    await this.redis.set("history/" + key, JSON.stringify(data));
    return data;
  }

  async deleteKey(key: string) {
    return await this.redis
      .del(key)
      .then(() => true)
      .catch(() => false);
  }
}
