import { readFileSync } from 'fs';
import { join } from 'path';
import z from 'zod';

const Config = z.object({
  tgToken: z.string(),
  redisConfig: z.string(),
});

export default (): z.infer<typeof Config> => {
  const file = JSON.parse(
    readFileSync(
      join('config', process.env.NODE_ENV, 'tg.config.json'),
      'utf8',
    ),
  );

  return Config.parse(file);
};
