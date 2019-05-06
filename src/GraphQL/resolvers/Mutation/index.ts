import userMutations from "./user";
import workspaceMutations from "./workspace";
import dataSourceMutations from "./dataSource";
import mediatorMutations from "./mediator";
import entityMutations from "./entity";
import { runQuery } from "../../../services";

export default {
  ...userMutations,
  ...workspaceMutations,
  ...dataSourceMutations,
  ...mediatorMutations,
  ...entityMutations,
  query: (_, { query }, { req }) => runQuery(query, req)
};
