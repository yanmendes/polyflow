const GraphQLJSON = require("graphql-type-json");

import Mutation from "./Mutation";
import Query from "./Query";

export default {
  JSON: GraphQLJSON,
  Query,
  Mutation
};
