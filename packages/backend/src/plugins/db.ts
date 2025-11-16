import fp from 'fastify-plugin';
import { Database } from '../Database';

export default fp(async (app) => {
  const db = new Database(app);
  app.decorate('db', db);
});
