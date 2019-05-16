import { getRepository } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { getDataSource } from "../../../services";
import { Mediator } from "../../../models/polyflow";
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.MEDIATOR
});

export default {
  addMediator: async (
    _,
    { name, slug, workspaceId, dataSourceId },
    { req }
  ) => {
    const dataSource = await getDataSource(req, workspaceId, dataSourceId);

    try {
      const mediator = await getRepository(Mediator).save({
        name,
        slug,
        dataSource
      });

      return mediator;
    } catch (e) {
      log
        .child({
          error: e,
          action: "adding_mediator"
        })
        .error("Mediator name/slug already in use for this data source");
      throw new UserInputError(
        "Mediator name/slug already in for this data source"
      );
    }
  }
};
