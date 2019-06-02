const mysql = require("promise-mysql");
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.DATABASE_INTERFACE
});

export const parseMysqlUrl = url => {
  const matches = /mysql:\/\/([^:]+):?([^@]+)?@([^:]+):?([\d+]+)?\/(.+)/.exec(
    url
  );

  if (!matches) {
    throw new Error(
      "Invalid MySQL URL. Valid format: mysql://user:password?@host:port?/database. Where ? are optional parameters"
    );
  }

  const [, user, password, host, port, database] = matches;
  return {
    user,
    password,
    host,
    port,
    database
  };
};

const mysqlInterface = {
  assertConnection: url =>
    mysql
      .createConnection(parseMysqlUrl(url))
      .then(client => client.end())
      .then(_ => true)
      .catch(
        e =>
          log
            .child({
              action: "Asserting MySQL connection",
              error: e.stack
            })
            .error("Could not connect to database") || false
      ),

  query: async (url: string, query: string) => {
    if (!query) {
      throw new Error("No query issued to this interface");
    }

    return mysql
      .createConnection(parseMysqlUrl(url))
      .then(client =>
        client.query(query).then(res => client.end().then(_ => res))
      )
      .catch(
        e =>
          log
            .child({
              action: "Querying MySQL instance",
              error: e.stack
            })
            .error("Could not query MySQL") || e
      );
  }
};

export default mysqlInterface;
