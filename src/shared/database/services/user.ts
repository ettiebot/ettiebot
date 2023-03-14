import type { DB } from '../index.js';
import Token from './token.js';

type Opts = { lang?: string; useTranslate?: boolean; useHistory?: boolean };

export default class UserService {
  static async getByToken(cols: DB, token: string) {
    const tokenObj = await Token.getByToken(cols, token);
    if (!tokenObj) return null;
    return await cols.users.findOne({ _id: tokenObj.userId });
  }

  static async createUser(cols: DB, opts: Opts = {}) {
    const { insertedId } = await cols.users.insertOne({
      appSettings: {
        lang: opts.lang,
        historyEnabled: opts.useHistory,
        translateEnabled: opts.useTranslate,
      },
    });

    return await cols.users.findOne({ _id: insertedId });
  }
}
