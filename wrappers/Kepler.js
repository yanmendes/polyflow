var Prov = require('../models/Prov'),
	Provone = require('../models/Provone'),
	models = require('../models/relational'),
	pg = require('../infra/PgsqlConnector'),
	_ = require('lodash');

//TODO: REFACTOR CODE USING PROV-PROVONE

var Kepler = function () {

};

Kepler.prototype.Port = () => {
	return new Promise((resolve, reject) => {
		return pg.query("select e.id as port_id, e.name as label, case when direction = 1 then 'out' when direction = 0 then 'in' end as port_type\n" +
			"from port p, entity e\n" +
			"where p.id = e.id", (err, res) => {
			if (err || res === undefined)
				reject(err);

			return models.provone_Port.bulkCreate(res.rows).then(() => {
				resolve();
			});
		});
	});
};

Kepler.prototype.Entity = () => {
	return new Promise((resolve, reject) => {
		return pg.query("select p.id as entity_id, e.name as label, p.type, p.value, 'provone_Data' as entity_type\n" +
			"from parameter p, entity e\n" +
			"where p.id = e.id\n" +
			"UNION ALL " +
			"select NULL as entity_id, ad.name as label, 'md5' as type, d.md5 as value, 'provone_Data' as entity_type\n" +
			"from data d\n" +
			"left join associated_data ad on d.md5 = ad.data_id", (err, res) => {
			if (err || res === undefined)
				reject(err);

			return models.prov_Entity.bulkCreate(res.rows).then(() => {
				resolve();
			});
		});
	});
};

Kepler.prototype.Program = () => {
	return new Promise((resolve, reject) => {
		return pg.query('select a.id as program_id, COALESCE(w.name, e.name) as label, case when w.id is not null then true else false end as "is_provone_Workflow", case when w.id is not null then NULL else e.wf_id end as "provone_hasSubProgram"\n' +
			"from actor a, entity e\n" +
			"left join workflow w on w.id = e.id\n" +
			"where a.id = e.id", (err, res) => {
			if (err || res === undefined)
				reject(err);

			return models.provone_Program.bulkCreate(res.rows).then(() => {
				resolve();
			});
		});
	});
};


//TODO: CHANGE THIS RANDOM GENERATORS
Kepler.prototype.Execution = () => {
	return new Promise((resolve, reject) => {
		return pg.query('select id as execution_id, actor_id as "prov_hadPlan", start_time as "prov_startedAtTime", end_time as "prov_endedAtTime" from actor_fire\n' +
			'UNION ALL\n' +
			'select FLOOR(random()*(10000)+1000) AS execution_id, wf_id as "prov_hadPlan", start_time as "prov_startedAtTime", end_time as "prov_endedAtTime" from workflow_exec', (err, res) => {
			if (err || res === undefined)
				reject(err);

			return models.prov_Association.bulkCreate(res.rows).then(() => {
				return models.provone_Execution.bulkCreate(res.rows);
			}).then(() => {
				return models.prov_Association.findAll({
					where: {
						prov_hadPlan: {$in: _.map(res.rows, 'prov_hadPlan')}
					}
				}).then((results) => {
					_.each(res.rows, (o) => {
						o.association_id = (_.find(results, {'prov_hadPlan': o.prov_hadPlan})).association_id;
						results = _.without(results, _.find(results, {'prov_hadPlan': o.prov_hadPlan}));
					});

					return models.prov_qualifiedAssociation.bulkCreate(res.rows);
				}).then(() => {
					resolve();
				});
			});
		});
	});
};

//TODO: FIX FUNCTION JOINING DATA_ID SINCE IT'S THE VALUE, NOT THE ID
Kepler.prototype.Usage = () => {
	return new Promise((resolve, reject) => {
		return pg.query('select data_id as "provone_hadEntity", port_id as "provone_hadInPort", fire_id as execution_id from port_event where write_event_id = -1', (err, res) => {
			if (err || res === undefined)
				reject(err);

			return models.prov_Usage.bulkCreate(res.rows).then(() => {
				return models.prov_Usage.findAll({
					where: {
						provone_hadInPort: {$in: _.map(res.rows, 'provone_hadInPort')}
					}
				}).then((results) => {
					_.each(res.rows, (o) => {
						o.usage_id = (_.find(results, {'provone_hadInPort': o.provone_hadInPort})).usage_id;
						results = _.without(results, _.find(results, {'provone_hadInPort': o.provone_hadInPort}));
					});

					return models.prov_qualifiedUsage.bulkCreate(res.rows)
				}).then(() => {
					resolve();
				});
			});
		});
	});
};

//TODO: FIX FUNCTION JOINING DATA_ID SINCE IT'S THE VALUE, NOT THE ID
Kepler.prototype.Generation = () => {
	return new Promise((resolve, reject) => {
		return pg.query('select data_id as "provone_hadEntity", port_id as "provone_hadOutPort", fire_id as execution_id from port_event where write_event_id != -1', (err, res) => {
			if (err || res === undefined)
				reject(err);

			return models.prov_Generation.bulkCreate(res.rows).then(() => {
				return models.prov_Generation.findAll({
					where: {
						provone_hadOutPort: {$in: _.map(res.rows, 'provone_hadOutPort')}
					}
				}).then((results) => {
					_.each(res.rows, (o) => {
						o.generation_id = (_.find(results, {'provone_hadOutPort': o.provone_hadOutPort})).generation_id;
						results = _.without(results, _.find(results, {'provone_hadOutPort': o.provone_hadOutPort}));
					});

					return models.prov_qualifiedGeneration.bulkCreate(res.rows)
				}).then(() => {
					resolve();
				});
			});
		});
	});
};

Kepler.prototype.PopulateExecutionRelations = () => {
	let users = null;
	return new Promise((resolve, reject) => {
		return pg.query("select user as label, wf_id from workflow_exec", (err, res) => {
			if (err || res === undefined)
				throw new err;

			return models.provone_User.bulkCreate(res.rows).then(function (results) {
				return models.provone_User.findAll();
			}).then((results) => {
				users = results;
				return models.provone_Execution.findAll({
					include: [{
						model: models.prov_Association,
						include: [
							{
								model: models.provone_Program,
								where: {
									$or: {
										provone_hasSubProgram: {$in: _.map(res.rows, 'wf_id')},
										program_id: {$in: _.map(res.rows, 'wf_id')}
									}
								}
							}
						]
					}]
				}).then(function (results) {
					let promises = [];

					_.each(results, (o) => {
						let wfExec = _.find(results, (execution) => {
							return execution.prov_Associations[0].provone_Program.program_id === o.prov_Associations[0].provone_Program.provone_hasSubProgram;
						});

						//TODO: IMPROVE THIS CODE'S READABILITY
						//Since Kepler models Execution to Program 1:1, this is correct
						promises.push(models.sequelize.query('UPDATE "provone_Executions" SET "prov_wasAssociatedWith" = :user, "provone_wasPartOf" = :wfexec WHERE execution_id = :execution_id', {
							replacements: {
								user: (_.find(users, {
									'label': (_.find(res.rows, (user) => {
										return user.wf_id === o.prov_Associations[0].provone_Program.provone_hasSubProgram || user.wf_id === o.prov_Associations[0].provone_Program.program_id;
									})).label
								})).user_id,
								wfexec: wfExec !== undefined ? wfExec.execution_id : null,
								execution_id: o.execution_id
							}
						}));
					});

					return Promise.all(promises);
				}).then(() => {
					resolve();
				}).catch(() => {
					reject();
				});
			});
		});
	});
};

Kepler.prototype.PopulatePortRelations = () => {
	return new Promise((resolve, reject) => {
		return pg.query('select distinct case when write_event_id = -1 then 0 else 1 end as write, pe.port_id, af.actor_id from port_event pe\n' +
			'inner join actor_fire af on pe.fire_id = af.id', (err, res) => {
			if (err || res === undefined)
				reject(err);

			let promises = [];

			_.each(res.rows, (o) => {
				var replacements = {
					port_id: o.port_id,
					value: o.actor_id
				};

				replacements.portType = (o.write) ? 'provone_hasOutPort' : 'provone_hasInPort';

				promises.push(models.sequelize.query('UPDATE "provone_Ports" SET "' + replacements.portType + '" = :value WHERE port_id = :port_id', {
					replacements: replacements
				}));
			});

			resolve(Promise.all(promises));
		});
	});
};

Kepler.prototype.PopulateEntityRelations = () => {
	return new Promise((resolve, reject) => {
		return pg.query('select distinct case when write_event_id = -1 then 0 else 1 end as write, coalesce(data, file_id, data_id) as data, fire_id as execution_id from port_event', (err, res) => {
			if (err || res === undefined)
				reject(err);

			let promises = [];

			_.each(res.rows, (o) => {
				var replacements = {
					entity_id: o.entity_id,
					data: o.data,
					execution_id: o.execution_id
				};

				replacements.relationType = (o.write) ? 'prov_wasGeneratedBy' : 'prov_used';

				promises.push(models.sequelize.query('UPDATE "prov_Entities" SET "' + replacements.relationType + '" = :execution_id WHERE value = :data ', {
					replacements: replacements
				}));
			});

			resolve(Promise.all(promises));
		});
	});
};


Kepler.prototype.execute = () => {
	return Kepler.prototype.Port().then(() => {
		return Kepler.prototype.Entity();
	}).then(() => {
		return Kepler.prototype.Program();
	}).then(() => {
		return Kepler.prototype.Execution();
	}).then(() => {
		return Kepler.prototype.Usage();
	}).then(() => {
		return Kepler.prototype.Generation();
	}).then(() => {
		return Kepler.prototype.PopulateExecutionRelations();
	}).then(() => {
		return Kepler.prototype.PopulatePortRelations();
	}).then(() => {
		return Kepler.prototype.PopulateEntityRelations();
	});
};

module.exports = Kepler;