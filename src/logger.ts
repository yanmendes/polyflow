const prettyPrint = { levelFirst: true, colorize: true, translateTime: true };

export default require("pino")({
  prettyPrint: process.env.NODE_ENV !== "production" && prettyPrint,
  useLevelLabels: true
});

export const categories = {
  DATA_SOURCE: "data_source",
  MEDIATOR: "mediator"
};
