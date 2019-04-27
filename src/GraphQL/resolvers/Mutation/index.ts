import userMutations from "./user";
import workspaceMutations from "./workspace";
import dataSourceMutations from "./dataSource";
import mediatorMutations from "./mediator";
import { runQuery } from "../../../services";

export default {
  ...userMutations,
  ...workspaceMutations,
  ...dataSourceMutations,
  ...mediatorMutations,
  query: (_, { query }, { req }) => runQuery(query, req)
};
