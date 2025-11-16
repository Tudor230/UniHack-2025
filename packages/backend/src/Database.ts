import { FastifyInstance } from "fastify";
import { App } from ".";

export class Database {
  private app: App;

  public constructor(app: FastifyInstance) {
    // @ts-ignore
    this.app = app;
  }

  public async query<T = any>(sql: string, bindings: string[] = []): Promise<T> {
    const response = await this.app.axios.post(
      "https://WJFQFNH-HF78597.snowflakecomputing.com/api/v2/statements",
      {
        statement: sql,
        bindings: Object.fromEntries(
          bindings.map((b, i) => [String(i + 1), { type: "TEXT", value: b }])
        ),
        warehouse: "COMPUTE_WH",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SNOWFLAKE_TOKEN}`,
          "User-Agent": "UnihackBackend/1.0.0",
        },
      }
    ).catch(e => {
        e.message = `Snowflake query failed: ${e.response.data.message}`;
        throw e;
    });

    return response.data;
  }
}
