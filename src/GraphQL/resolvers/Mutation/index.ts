import userMutations from "./user";
import workspaceMutations from "./workspace";
import { runQuery } from "../../../services";

export default {
  ...userMutations,
  ...workspaceMutations,
  query: (_, { query }, { req }) => runQuery(query, req)
};
