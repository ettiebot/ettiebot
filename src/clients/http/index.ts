import fastify from 'fastify';
import fastifyAuth from '@fastify/auth';
import fastifyMultipart from '@fastify/multipart';
import config from './modules/config.js';
import initMongo, { DB } from '../../shared/database/index.js';
import registerRoutes from './router/index.js';
import { AliceClient, YandexTranslator } from '../../shared/packages/index.js';
import fastifyCors from '@fastify/cors';

export class HTTPClient {
  public c = config();
  public router: fastify.FastifyInstance;
  public db: DB;
  public yt = new YandexTranslator();
  public alice = new AliceClient({ log: true });

  constructor() {
    this.router = fastify({
      logger: true,
    });

    void this.startServer();
  }

  private async startServer() {
    // Init MongoDB
    this.db = await initMongo(this.c.mongoConfig, this.c.mongoDb);
    // Init Alice
    this.alice.connect();
    // Register router
    await this.router
      .register(fastifyCors, {
        origin: '*',
      })
      .register(fastifyAuth)
      .register(fastifyMultipart);
    // Register routes
    registerRoutes.bind(this)();
    // Listen server
    await this.router.listen({ host: '0.0.0.0', port: this.c.port });
  }
}
