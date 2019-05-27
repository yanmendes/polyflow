const prettyPrint = { levelFirst: true, colorize: true, translateTime: true };
export default require("pino")(
  {
    prettyPrint: process.env.NODE_ENV !== "production" && prettyPrint,
    useLevelLabels: true
  },
  process.env.LOGFILE
);

export const categories = {
  DATA_SOURCE: "data_source",
  MEDIATOR: "mediator",
  ENTITY: "entity",
  POLYFLOW_CORE: "polyflow_core",
  DATABASE_INTERFACE: "database_interface"
};
