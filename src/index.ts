import "reflect-metadata";
import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import * as session from "express-session";
import * as pino from "express-pino-logger";
import { createConnection } from "typeorm";
import * as cors from "cors";

import { port } from "./config";
import logger from "./logger";
import schema from "./GraphQL";

const startServer = async () => {
  await createConnection();

  const app = express();

  app.use(cors());
  app.use(pino({ logger }));

  app.get("/", (_, res) => res.status(200).send("ok!"));

  const server = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res })
  });

  app.use(
    session({
      secret: "i5n31io13ip5h1p",
      resave: false,
      saveUninitialized: false
    })
  );

  server.applyMiddleware({ app });

  app.listen({ port }, () => console.log(`Server ready. Lestining on ${port}`));
};

startServer().catch(e => logger.error(e));
