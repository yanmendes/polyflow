import * as bcrypt from "bcryptjs";
import { getConnection } from "typeorm";

import { User } from "./models/polyflow/User";
import { Workspace } from "./models/polyflow/Workspace";

const getCurrentUser = req => {
  if (!req.session.userId) {
    throw new Error("You must be logged in to access this feature");
  }

  return User.findOne(req.session.userId, { relations: ["workspaces"] });
};

export default {
  Query: {
    getWorkspaces: (_, __, { req }) =>
      getCurrentUser(req).then(user => user.workspaces)
  },
  Mutation: {
    logout: async (_, __, { req, res }) => {
      await new Promise(res => req.session.destroy(() => res()));
      res.clearCookie("connect.sid");
      return true;
    },
    register: async (_, { email, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        email,
        password: hashedPassword
      }).save();

      return true;
    },
    login: async (_, { email, password }, { req }) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return null;
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return null;
      }

      req.session.userId = user.id;

      return user;
    },
    createWorkspace: async (_, { name }, { req }) => {
      const user = await getCurrentUser(req.session.userId);
      const workspace = (new Workspace().name = name);

      await workspace.save();

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
  }
};
