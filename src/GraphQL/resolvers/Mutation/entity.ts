import { getRepository } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { getMediator } from "../../../services";
import { Entity } from "../../../models/polyflow";
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.ENTITY
});

export default {
  addEntity: async (
    _,
    { name, slug, entityMapper, workspaceId, dataSourceId, mediatorId },
    { req }
  ) =>
    getMediator(req, workspaceId, dataSourceId, mediatorId)
      .then(mediator =>
        getRepository(Entity).save({
          name,
          slug,
          entityMapper,
          mediator
        })
      )
      .then(_ => true)
      .catch(e => {
        log
          .child({
            error: e,
            action: "adding_mediator"
          })
          .error("Entity name/slug already in use for this mediator");
        throw new UserInputError(
          "Entity name/slug already in use for this mediator"
        );
      })
};
