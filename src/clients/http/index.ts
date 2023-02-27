import fastify from 'fastify';
import config from './modules/config.js';
import registerRoutes from './router/index.js';
import registerOpenAPI from './router/routes/openapi.js';
import fastifyCors from '@fastify/cors';
import fastifyAuth from '@fastify/auth';
import InquirerClient from '../../shared/classes/inquirerClient.js';
import { Config } from '../ws/modules/config.js';
import initMongo, { DB } from '../../shared/database/index.js';

export class HTTPClient extends InquirerClient {
  private c: Config;
  public router: fastify.FastifyInstance;
  public db: DB;

  constructor() {
    const c = config();
    super(c.redisConfig, false);
    this.c = c;

    this.router = fastify({
      logger: true,
    });

    void this.startServer();
  }

  private async startServer() {
    this.db = await initMongo(this.c.mongoConfig, this.c.mongoDb);
    await this.router
      .register(fastifyCors, {
        origin: '*',
      })
      .register(fastifyAuth);
    await registerOpenAPI.bind(this)();
    registerRoutes.bind(this)();
    await this.router.listen({ host: '0.0.0.0', port: this.c.port });
  }
}
