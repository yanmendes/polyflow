import { Client } from "pg";
import logger from "../logger";
export const assertConnection = url => url;

export default async (url: string, query: string) => {
  if (!query) {
    throw new Error("No query issued to this interface");
  }

  const client = new Client({ connectionString: url });
  return client
    .connect()
    .then(() => client.query(query))
    .then(res => client.end().then(() => res.rows))
    .catch(e => logger.error(e) || e);
};
