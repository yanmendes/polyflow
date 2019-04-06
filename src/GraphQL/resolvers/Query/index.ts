import { getCurrentUser, runQuery } from "../../../services";

export default {
  getWorkspaces: (_, __, { req }) =>
    getCurrentUser(req).then(user => user.workspaces),

  shootQuery: (_, { query }, { req }) => runQuery(query, req)
};
