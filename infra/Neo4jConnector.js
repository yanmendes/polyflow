const neo4j = require('neo4j-driver').v1;

const driver = neo4j.driver(process.env.NEO4JURI, neo4j.auth.basic(process.env.NEO4JUSER, process.env.NEO4JPASSWORD));

module.exports = driver.session();