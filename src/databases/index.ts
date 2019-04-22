import psqlInterface from "./psqlInterface";

export const types = {
  POSTGRES: "postgres"
};

export { psqlInterface };

export const getInterface = type =>
  type === types.POSTGRES ? psqlInterface : undefined;
