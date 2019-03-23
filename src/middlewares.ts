import { User } from "./models/Polyflow/User";

const getUser = userId => {
  if (!userId) {
    return null;
  }

  return User.findOne(userId, { relations: ["workspaces"] });
};

export const userBelongsToWorkspace = async (req, res, next) => {
  return next();

  // Todo: Gotta fix this. Express and GraphQL have two different req contexts
  // and, because of that, I can't access req.session.userId here.
  if (!req.session || !req.session.userId) {
    return res.status(404).send("You must be logged in to access this feature");
  }
  const user = await getUser(req.session.userId);
  !user ||
  user.workspaces.filter(item => item.id === req.params.workspaceId) === []
    ? res.status(404).send("User does not belong to workspace")
    : next();
};
