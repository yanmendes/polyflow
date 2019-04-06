import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { makeExecutableSchema } from "graphql-tools";

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
