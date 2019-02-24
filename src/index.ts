import "reflect-metadata";
import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import * as pino from "express-pino-logger";
import { createConnection } from "typeorm";
import * as cors from "cors";

import { port } from "./config";
import logger from "./logger";
import query from "./routes/query";
import typeDefs from "./types/GraphQLTypes";
import resolvers from "./resolvers";

const startServer = async () => {
  await createConnection();

  const app = express();

  const options = { origin: process.env.FRONTEND_URL };

  app.use(cors(options));
  app.use(pino({ logger }));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.get("/", (_, res) => res.status(200).send("ok!"));

  app.use("/query", query);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
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
