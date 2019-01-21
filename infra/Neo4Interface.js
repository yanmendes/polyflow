'use strict';

const neo4j = require('neo4j-driver').v1;

function connect() {
  const driver = neo4j.driver(process.env.NEO4JURI, neo4j.auth.basic(process.env.NEO4JUSER, process.env.NEO4JPASSWORD));
  const neo4j = driver.session();
}

module.exports = (query) => {
  return new Promise((resolve, reject) => {
    if (query)
      neo4j.run(query).then((result) => {
        resolve(result.records)
      });
    else
      resolve('No query issued to this interface');
  });
};
