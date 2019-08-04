import "reflect-metadata";
import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import * as pino from "express-pino-logger";
import { createConnection } from "typeorm";

import { port, psqlURL } from "./config";
import logger from "./logger";
import schema from "./GraphQL";

const startServer = async () => {
  const server = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
    playground: true,
    introspection: true
  });

  await createConnection({
    entities: ["dist/models/polyflow/**/*.js"],
    synchronize: true,
    url: psqlURL,
    type: "postgres"
  });

  const app = express();

  app.use(pino({ logger }));

  server.applyMiddleware({
    path: "/",
    app,
    cors: {
      credentials: true,
      origin: "*"
    }
  });

  app.listen({ port }, () => console.log(`Server ready. Lestining on ${port}`));
};

startServer().catch(e => logger.error(e));
