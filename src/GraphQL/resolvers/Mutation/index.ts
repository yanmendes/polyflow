import userMutations from "./user";
import workspaceMutations from "./workspace";

export default {
  ...userMutations,
  ...workspaceMutations
};
