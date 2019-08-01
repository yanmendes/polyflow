import { getRepository } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { getInterface } from "../../../core/databases";
import { DataSource } from "../../../models/polyflow";
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.DATA_SOURCE
});

export default {
  addDataSource: async (_, { type, uri }) => {
    const dbInterface = getInterface(type);
    const validConnection = await dbInterface.assertConnection(uri);

    if (!validConnection) {
      throw new UserInputError("Invalid URI for the chosen type");
    }

    try {
      const dataSource = await getRepository(DataSource).save({
        uri,
        type
      });
      return dataSource;
    } catch (e) {
      log
        .child({
          error: e,
          action: "adding_data_source"
        })
        .error("URI already exists");
      throw new UserInputError("URI already exists");
    }
  }
};
