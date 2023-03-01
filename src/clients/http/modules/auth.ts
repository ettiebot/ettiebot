import type { HTTPClient } from '../index.js';
import UserService from '../../../shared/database/services/user.js';

export default async function verifyToken(this: HTTPClient, request, _, done) {
  console.log(request.headers);
  const token = request.headers['x-token'] as string;
  if (!token) {
    return done(new Error('Missing token'));
  }

  const userObj = await UserService.getByToken(this.db, token);
  request.headers.user = userObj;
  done();
}
