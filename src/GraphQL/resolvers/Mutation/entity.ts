import { getRepository } from "typeorm";

import { getMediator } from "../../../services";
import { Entity } from "../../../models/polyflow";

export default {
  addEntity: async (
    _,
    { name, slug, entityMapper, workspaceId, dataSourceId, mediatorId },
    { req }
  ) =>
    getMediator(req, workspaceId, dataSourceId, mediatorId).then(mediator =>
      getRepository(Entity).save({
        name,
        slug,
        entityMapper,
        mediator
      })
    )
};
