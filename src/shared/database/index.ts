import { Collection, MongoClient } from 'mongodb';
import { Token, User } from '../ts/mongo.js';

export type DB = {
  tokens: Collection<Token>;
  users: Collection<User>;
};

export default async function initMongo(mongoURL: string, mongoDB: string) {
  const client = new MongoClient(mongoURL);
  await client.connect();

  const db = client.db(mongoDB);

  const cols: DB = {
    tokens: db.collection<Token>('tokens'),
    users: db.collection<User>('users'),
  };

  return cols;
}
