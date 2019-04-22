import { getConnection } from "typeorm";

import { User, Workspace } from "../../../models/polyflow";
import { getCurrentUser } from "../../../services";

export default {
  createWorkspace: async (_, { name }, { req }) => {
    const user = await getCurrentUser(req);
    const workspace = await Workspace.create({ name }).save();

    return getConnection()
      .createQueryBuilder()
      .relation(User, "workspaces")
      .of(user)
      .add(workspace)
      .then(_ => workspace)
      .catch(e => req.log.error(e));
  },

  addUserToWorkspace: (_, { workspaceId, userId }, { req }) =>
    getCurrentUser(req)
      .then(user =>
        user.workspaces.find(item => item.id === parseInt(workspaceId, 10))
      )
      .then(async workspace => {
        if (!workspace) {
          throw new Error("User does not belong to workspace");
        }

        const user = await User.findOne(userId);

        if (!user) {
          throw new Error("User does not exist");
        }

        await getConnection()
          .createQueryBuilder()
          .relation(User, "workspaces")
          .of(user)
          .add(workspace);

        return true;
      })
};
