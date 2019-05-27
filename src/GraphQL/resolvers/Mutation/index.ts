import userMutations from "./user";
import workspaceMutations from "./workspace";
import dataSourceMutations from "./dataSource";
import mediatorMutations from "./mediator";
import entityMutations from "./entity";
import { runQuery } from "../../../core";
import { measure } from "../../../performance";
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.POLYFLOW_CORE
});

export default {
  ...userMutations,
  ...workspaceMutations,
  ...dataSourceMutations,
  ...mediatorMutations,
  ...entityMutations,
  query: (_, { query }, { req }) =>
    measure(log, "Transforming and running issued query", () =>
      runQuery(query, req)
    )
};
