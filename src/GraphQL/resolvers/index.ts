const GraphQLJSON = require("graphql-type-json");

import Mutation from "./Mutation";
import { runQuery } from "../../core";
import { measure } from "../../performance";

import logger, { categories } from "../../logger";

const log = logger.child({
  category: categories.POLYFLOW_CORE
});

export default {
  JSON: GraphQLJSON,
  Query: {
    query: (_, { query }) =>
      measure(log, "Transforming and running issued query", () =>
        runQuery(query)
      )
  },
  Mutation
};
