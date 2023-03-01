import type { DB } from '../index.js';

export default class Token {
  static async getByToken(cols: DB, token: string) {
    return await cols.tokens.findOne({ token });
  }

  static async createToken(cols: DB, userId: string, token: string) {
    return await cols.tokens.insertOne({ userId, token });
  }
}
