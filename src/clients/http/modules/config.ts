import { readFileSync } from 'fs';
import { join } from 'path';
import z from 'zod';

const Config = z.object({
  port: z.number(),
  redisConfig: z.string(),
  mongoConfig: z.string(),
  mongoDb: z.string(),
});

export default (): z.infer<typeof Config> => {
  const file = JSON.parse(
    readFileSync(
      join('config', process.env.NODE_ENV, 'http.config.json'),
      'utf8',
    ),
  );

  return Config.parse(file);
};
