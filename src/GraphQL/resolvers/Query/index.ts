import { getCurrentUser } from "../../../services";

export default {
  getWorkspaces: (_, __, { req }) =>
    getCurrentUser(req).then(user => user.workspaces)
};
