import { readFileSync } from 'fs';
import { join } from 'path';
import z from 'zod';

const config = z.object({
  port: z.number(),
  redisConfig: z.string(),
  mongoConfig: z.string(),
  mongoDb: z.string(),
  googleBucketName: z.string(),
});

export type Config = z.infer<typeof config>;

export default (): Config => {
  const file = JSON.parse(
    readFileSync(
      join('config', process.env.NODE_ENV, 'ws.config.json'),
      'utf8',
    ),
  );

  return config.parse(file);
};
