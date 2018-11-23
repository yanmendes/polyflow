const exec = require('child_process').exec;
const sprintf = require('sprintf-js').sprintf;
const CustomError = require('../infra/CustomError');

const Taverna = function () {

};


Taverna.prototype.execute = (filePath, workflowIdentifier) => {
	return new Promise((resolve, reject) => {
		const path = __dirname + '/../infra/TavernaWrapper.jar';
		exec(sprintf('java -jar "%s" %s %s %s %s "file://%s"', path, process.env.NEO4JURI, process.env.NEO4JUSER, process.env.NEO4JPASSWORD, workflowIdentifier, filePath),
			function (error, stdout) {
				if (error) {
					console.error(`exec error: ${error}`);
					console.error(stdout);
					reject({error, stdout});
				} else
					resolve(stdout);
			});
	});
};

module.exports = Taverna;