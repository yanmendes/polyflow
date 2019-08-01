import dataSourceMutations from "./dataSource";
import mediatorMutations from "./mediator";
import entityMutations from "./entity";

export default {
  ...dataSourceMutations,
  ...mediatorMutations,
  ...entityMutations
};
