import { Database } from "./Database";

declare module "fastify" {
  interface FastifyInstance {
    db: Database;
  }
}
