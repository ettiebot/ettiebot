import Redis from "ioredis";
import { MessagesHistoryItem } from "../types";

export default class History {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async get(key: string): Promise<MessagesHistoryItem[]> {
    const data = await this.redis.get("history/" + key);
    return data ? JSON.parse(data) : [];
  }

  async push(key: string, payload: MessagesHistoryItem) {
    let data = [];

    const redisVal = await this.redis.get("history/" + key);
    if (!redisVal) data = [payload];
    else {
      data = JSON.parse(redisVal);
      if (data.length > 50) data = data.splice(0, data.length - 1);
      data.push(payload);
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
