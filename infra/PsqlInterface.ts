"use strict";

const pgp = require("pg-promise")();

export default (query: string) => {
  const db = pgp(process.env.PG_URI);

  if (!query) {
    throw new Error("No query issued to this interface");
  }

  return db.any(query);
};
