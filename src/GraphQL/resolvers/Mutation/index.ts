import { getConnection } from "typeorm";
import { UserInputError } from "apollo-server-core";

import { getInterface } from "../../../databases";
import userMutations from "./user";
import workspaceMutations from "./workspace";
import { runQuery, getWorkspace } from "../../../services";
import { DataSource } from "../../../models/polyflow";

export default {
  ...userMutations,
  ...workspaceMutations,

  addDataSource: async (_, { workspaceId, type, uri }, { req }) => {
    const workspace = await getWorkspace(req, workspaceId);

    const dbInterface = getInterface(type);
    const validConnection = await dbInterface.assertConnection(uri);

    if (!validConnection) {
      throw new UserInputError("Invalid URI for the chosen type");
    }

    const dataSource = await DataSource.create({ uri, type }).save();

    await getConnection()
      .createQueryBuilder()
      .relation(DataSource, "workspace")
      .of(dataSource)
      .set(workspace);

    return true;
  },

  query: (_, { query }, { req }) => runQuery(query, req)
};
