import userMutations from "./user";
import workspaceMutations from "./workspace";
import dataSourceMutations from "./dataSource";
import { runQuery } from "../../../services";

export default {
  ...userMutations,
  ...workspaceMutations,
  ...dataSourceMutations,
  query: (_, { query }, { req }) => runQuery(query, req)
};
