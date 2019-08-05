import { runQuery } from "../../core";
import { measure } from "../../performance";
import logger, { categories } from "../../logger";
import { DataSource, Entity, Mediator } from "../../models/polyflow";

const log = logger.child({
  category: categories.POLYFLOW_CORE
});

export default {
  query: (_, { query }) =>
    measure(log, "Transforming and running issued query", () =>
      runQuery(query).catch(e => {
        log.child({
          error: e.stack || e,
          message: `Something went wrong while processing your query: ${e}`
        });

        throw e;
      })
    ),

  dataSources: () => DataSource.find({ relations: ["mediators"] }),

  mediators: () => Mediator.find({ relations: ["dataSource", "entities"] }),

  entities: () => Entity.find({ relations: ["mediator"] })
};
