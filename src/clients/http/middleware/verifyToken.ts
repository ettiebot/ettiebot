import UserService from '../../../shared/database/services/user.js';
import type { HTTPClient } from '../index.js';

export default function verifyToken(this: HTTPClient, request, _, done) {
  const token = request.headers['x-token'] as string;
  if (!token) return done(new Error('Missing token'));

  UserService.getByToken(this.db, token)
    .then((userObj) => {
      console.log(userObj);
      if (!userObj) return done(new Error('Invalid token'));
      request.headers.user = userObj;
      done();
    })
    .catch((e) => done(e));
}
