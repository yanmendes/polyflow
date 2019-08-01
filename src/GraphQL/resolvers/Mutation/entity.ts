import { getRepository } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { Entity, Mediator } from "../../../models/polyflow";
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.ENTITY
});

export default {
  addEntity: async (_, { name, slug, entityMapper, mediatorId }) =>
    Mediator.findOne(mediatorId)
      .then(mediator =>
        getRepository(Entity).save({
          name,
          slug,
          entityMapper,
          mediator
        })
      )
      .catch(e => {
        log
          .child({
            error: e,
            action: "adding_entity"
          })
          .error("Entity name/slug already in use for this mediator");

        throw new UserInputError(
          "Entity name/slug already in for this mediator"
        );
      })
};
