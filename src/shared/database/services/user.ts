import type { DB } from '../index.js';
import Token from './token.js';

type Opts = { lang?: string; useTranslate?: boolean; useHistory?: boolean };

export default class UserService {
  static async getByToken(cols: DB, token: string, opts: Opts = {}) {
    try {
      const tokenObj = await Token.getByToken(cols, token);
      if (!tokenObj) {
        const userObj = await this.createUser(cols, opts);
        await Token.createToken(cols, userObj._id, token);
        return userObj;
      } else return await cols.users.findOne({ _id: tokenObj.userId });
    } catch (e) {
      console.error(e);
      return null;
    }
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
