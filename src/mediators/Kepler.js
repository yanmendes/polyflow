import Prov from '../../models/Prov'
import Provone from '../../models/Provone'
import pg from '../../infra/PsqlInterface'
import _ from 'lodash'

const { SQL_INNER_JOIN, SQL_UNION, SQL_LEFT_JOIN } = require('../mediators/mediationTypes')

// TODO: REFACTOR CODE USING PROV-PROVONE

// Avoid giving the same alias to different entities
const ePort = { name: 'port', alias: 'p', columns: { port_id: 'p.id', port_type: `CASE WHEN p.direction = 1 THEN 'out' WHEN p.direction = 0 THEN 'in' END` } }
const eEntity = { name: 'entity', alias: 'e', columns: { label: 'e.name' } }

const eParameter = {
  name: 'parameter',
  alias: 'param',
  columns: {
    entity_id: 'param.id',
    type: 'param.type',
    value: 'param.value',
    entity_type: `'provone_Data'`
  }
}

const eAssociatedData = { name: 'associated_data', alias: 'ad', columns: { label: 'ad.name' } }
const eData = { name: 'data', alias: 'd', columns: { value: 'd.md5' } }

const eActor = { name: 'actor', alias: 'a', columns: { program_id: 'a.id' } }
const eWorkflow = { name: 'workflow', alias: 'w' }

export default {
  [Provone.Classes.PORT]: {
    entity1: ePort,
    entity2: eEntity,
    type: SQL_INNER_JOIN,
    columns: { ...ePort.columns, ...eEntity.columns },
    params: ['p.id', 'e.id']
  },
  [Prov.Classes.ENTITY]: {
    entity1: {
      entity1: eParameter,
      entity2: eEntity,
      type: SQL_INNER_JOIN,
      columns: { ...eParameter.columns, ...eEntity.columns },
      params: ['param.id', 'e.id']
    },
    entity2: {
      entity1: eData,
      entity2: eAssociatedData,
      type: SQL_LEFT_JOIN,
      params: ['d.md5', 'ad.data_id'],
      columns: {
        entity_id: 'NULL',
        type: `'md5'`,
        ...eData.columns,
        entity_type: `'provone_Data'`,
        ...eAssociatedData.columns
      }
    },
    type: SQL_UNION
  },
  [Provone.Classes.PROGRAM]: {
    entity1: eActor,
    entity2: {
      entity1: eEntity,
      entity2: eWorkflow,
      type: SQL_LEFT_JOIN,
      columns: {
        joinId: `e.id`,
        label: `COALESCE(w.name, e.name)`,
        ipw: `CASE WHEN w.id IS NOT NULL THEN TRUE ELSE FALSE END`,
        phssubp: `CASE WHEN w.id IS NOT NULL THEN NULL ELSE e.wf_id END`
      },
      params: ['w.id', 'e.id']
    },
    columns: { program_id: 'a.id', label: 'label', is_provone_Workflow: 'ipw', provone_hasSubProgram: 'phssubp' },
    type: SQL_INNER_JOIN,
    params: ['program_id', 'joinId']
  }
}

var Kepler = function () {

}

/* global insert, db */

Kepler.prototype.execute = (workflowIdentifier) => {
  return Kepler.prototype.Port(workflowIdentifier).then(() => {
    return Kepler.prototype.Entity(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.Program(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.Execution(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.Usage(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.Generation(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.PopulateExecutionRelations(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.PopulatePortRelations(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.PopulateEntityRelations(workflowIdentifier)
  })
}

Kepler.prototype.Program = (workflowIdentifier) => {
  return new Promise((resolve, reject) => {
    return pg.query('select a.id as program_id, COALESCE(w.name, e.name) as label, case when w.id is not null then true else false end as "is_provone_Workflow", case when w.id is not null then NULL else e.wf_id end as "provone_hasSubProgram"\n' +
      'from actor a, entity e\n' +
      'left join workflow w on w.id = e.id\n' +
      'where a.id = e.id', (err, res) => {
      if (err || res === undefined) { return reject(err) } else { return resolve(insert(Provone.Classes.PROGRAM, _.map(res.rows, (o) => { return _.extend({}, o, { workflow_identifier: workflowIdentifier }) }))) }
    })
  })
}

// TODO: CHANGE THIS RANDOM GENERATORS
Kepler.prototype.Execution = (workflowIdentifier) => {
  return new Promise((resolve, reject) => {
    return pg.query(`select id as execution_id, actor_id as "prov_hadPlan", to_char(start_time, 'dd-mon-yyyy hh24:mi:ss') as "prov_startedAtTime", to_char(end_time, 'dd-mon-yyyy hh24:mi:ss') as "prov_endedAtTime" from actor_fire\n` +
      'UNION ALL\n' +
      `select FLOOR(random()*(10000)+1000) AS execution_id, wf_id as "prov_hadPlan", to_char(start_time, 'dd-mon-yyyy hh24:mi:ss') as "prov_startedAtTime", to_char(end_time, 'dd-mon-yyyy hh24:mi:ss') as "prov_endedAtTime" from workflow_exec`, (err, res) => {
      if (err || res === undefined) { return reject(err) }

      res.rows = _.map(res.rows, (o) => { return _.extend({}, o, { workflow_identifier: workflowIdentifier }) })

      let associations = _.map(res.rows, _.partialRight(_.pick, ['prov_hadPlan', 'workflow_identifier']))
      let executions = _.map(res.rows, _.partialRight(_.pick, ['execution_id', 'prov_startedAtTime', 'prov_endedAtTime', 'workflow_identifier']))

      return resolve(insert(Provone.Classes.EXECUTION, executions).then(() => {
        return insert(Prov.Classes.ASSOCIATION, associations)
      }).then(() => {
        return db.query(`SELECT association_id, prov_hadPlan, workflow_identifier FROM ${Prov.Classes.ASSOCIATION} WHERE prov_hadPlan IN (?) AND workflow_identifier = ?`, {
          type: db.QueryTypes.SELECT,
          replacements: [associations.map(a => a.prov_hadPlan), workflowIdentifier]
        })
      }).then((results) => {
        let qualifiedAssociations = _.map(_.map(results, (o) => {
          return _.extend({}, o, { execution_id: _.find(res.rows, { 'prov_hadPlan': o.prov_hadplan }).execution_id })
        }), _.partialRight(_.pick, ['association_id', 'execution_id', 'workflow_identifier']))
        return insert(Prov.Relationships.QUALIFIEDASSOCIATION, qualifiedAssociations)
      }))
    })
  })
}

Kepler.prototype.Usage = (workflowIdentifier) => {
  return new Promise((resolve, reject) => {
    return pg.query('select data as "value", port_id as "provone_hadInPort", fire_id as execution_id from port_event where write_event_id = -1', (err, res) => {
      if (err || res === undefined) { return reject(err) }

      res.rows = _.map(res.rows, (o) => { return _.extend({}, o, { workflow_identifier: workflowIdentifier }) })
      let search = 'e.value LIKE \'' + _.join(res.rows.map(a => a.value.replace('\'', '')), '\' OR e.value LIKE \'')

      resolve(db.query(`SELECT entity_id, value FROM ${Prov.Classes.ENTITY} e WHERE ${search} AND workflow_identifier = ?`, {
        type: db.QueryTypes.SELECT,
        replacements: [workflowIdentifier]
      }).then((results) => {
        let usage = _.map(_.map(res.rows, (o) => {
          return _.extend({}, o, { provone_hadEntity: _.find(results, (a) => { return a.value.replace('\'', '') === o.value.replace('\'', '') }).entity_id })
        }), _.partialRight(_.pick, ['provone_hadInPort', 'provone_hadEntity', 'workflow_identifier']))

        return insert(Prov.Classes.USAGE, usage)
      }).then(() => {
        return db.query(`SELECT usage_id, provone_hadinport, workflow_identifier FROM ${Prov.Classes.USAGE} e WHERE workflow_identifier = ?`, {
          type: db.QueryTypes.SELECT,
          replacements: [workflowIdentifier]
        })
      }).then((results) => {
        let qualifiedUsage = _.map(_.map(results, (o) => {
          return _.extend({}, o, { execution_id: _.find(res.rows, { 'provone_hadInPort': o.provone_hadinport }).execution_id })
        }), _.partialRight(_.pick, ['usage_id', 'execution_id', 'workflow_identifier']))

        return insert(Prov.Relationships.QUALIFIEDUSAGE, qualifiedUsage)
      }))
    })
  })
}

Kepler.prototype.Generation = (workflowIdentifier) => {
  return new Promise((resolve, reject) => {
    return pg.query('select data as "value", port_id as "provone_hadOutPort", fire_id as execution_id from port_event where write_event_id != -1', (err, res) => {
      if (err || res === undefined) { return reject(err) }

      res.rows = _.map(res.rows, (o) => { return _.extend({}, o, { workflow_identifier: workflowIdentifier }) })
      let search = 'e.value LIKE \'' + _.join(res.rows.map(a => a.value === null ? '' : a.value.replace('\'', '')), '\' OR e.value LIKE \'')

      resolve(db.query(`SELECT entity_id, value FROM ${Prov.Classes.ENTITY} e WHERE ${search} AND workflow_identifier = ?`, {
        type: db.QueryTypes.SELECT,
        replacements: [workflowIdentifier]
      }).then((results) => {
        let generation = _.map(_.map(res.rows, (o) => {
          let hadEntity = _.find(results, (a) => { return a.value === null || o.value === null ? false : a.value.replace('\'', '') === o.value.replace('\'', '') })
            ? _.find(results, (a) => { return a.value === null || o.value === null ? false : a.value.replace('\'', '') === o.value.replace('\'', '') }).entity_id : null
          return _.extend({}, o, { provone_hadEntity: hadEntity })
        }), _.partialRight(_.pick, ['provone_hadOutPort', 'provone_hadEntity', 'workflow_identifier']))

        return insert(Prov.Classes.GENERATION, generation)
      }).then(() => {
        return db.query(`SELECT generation_id, provone_hadoutport, workflow_identifier FROM ${Prov.Classes.GENERATION} e WHERE workflow_identifier = ?`, {
          type: db.QueryTypes.SELECT,
          replacements: [workflowIdentifier]
        })
      }).then((results) => {
        let qualifiedGeneration = _.map(_.map(results, (o) => {
          return _.extend({}, o, { execution_id: _.find(res.rows, { 'provone_hadOutPort': o.provone_hadoutport }).execution_id })
        }), _.partialRight(_.pick, ['generation_id', 'execution_id', 'workflow_identifier']))

        return insert(Prov.Relationships.QUALIFIEDGENERATION, qualifiedGeneration)
      }))
    })
  })
}

Kepler.prototype.PopulateExecutionRelations = (workflowIdentifier) => {
  let users = null
  return new Promise((resolve, reject) => {
    return pg.query('select user as label, wf_id AS program_id from workflow_exec', (err, res) => {
      if (err || res === undefined) { return reject(err) }

      res.rows = _.map(res.rows, (o) => {
        return _.extend({}, o, { workflow_identifier: workflowIdentifier })
      })

      return resolve(insert(Provone.Classes.USER, _.map(res.rows, _.partialRight(_.pick, ['label', 'workflow_identifier'])
      )).then(() => {
        return db.query(`SELECT * FROM ${Provone.Classes.USER} u WHERE workflow_identifier = ?`, { type: db.QueryTypes.SELECT, replacements: [workflowIdentifier] })
      }).then((results) => {
        users = _.map(results, (o) => {
          return _.extend({}, o, { program_id: _.find(res.rows, { 'label': o.label }).program_id })
        })

        return db.query(`SELECT e.execution_id, e2.execution_id AS provone_waspartof, p.program_id, p.provone_hassubprogram AS wf_id ` +
          `FROM ${Provone.Classes.EXECUTION} e ` +
          `INNER JOIN ${Prov.Relationships.QUALIFIEDASSOCIATION} qa ON qa.execution_id = e.execution_id AND qa.workflow_identifier = e.workflow_identifier ` +
          `INNER JOIN ${Prov.Classes.ASSOCIATION} a ON qa.association_id = a.association_id AND qa.workflow_identifier = a.workflow_identifier ` +
          `INNER JOIN ${Provone.Classes.PROGRAM} p ON p.program_id = a.prov_hadplan AND p.workflow_identifier = a.workflow_identifier ` +
          `LEFT JOIN ${Prov.Classes.ASSOCIATION} a2 ON p.provone_hassubprogram = a.prov_hadplan AND p.workflow_identifier = a2.workflow_identifier ` +
          `LEFT JOIN ${Prov.Relationships.QUALIFIEDASSOCIATION} qa2 ON qa2.association_id = a2.association_id AND qa2.workflow_identifier = a2.workflow_identifier ` +
          `LEFT JOIN ${Provone.Classes.EXECUTION} e2 ON qa2.execution_id = e2.execution_id AND qa2.workflow_identifier = e2.workflow_identifier ` +
          `WHERE e.workflow_identifier = :wid AND (p.program_id IN (:programs) OR p.provone_hassubprogram IN (:programs))`, {
          type: db.QueryTypes.SELECT,
          replacements: { wid: workflowIdentifier, programs: res.rows.map(a => a.program_id) }
        })
      }).then((results) => {
        let promises = []

        _.each(results, (o) => {
          promises.push(db.query(`UPDATE ${Provone.Classes.EXECUTION} SET prov_wasassociatedwith = :uid, provone_waspartof = :partof WHERE execution_id = :eid AND workflow_identifier = :wid`, {
            replacements: {
              uid: (_.find(users, (u) => { return u.program_id === o.program_id || u.program_id === o.wf_id }))
                ? (_.find(users, (u) => { return u.program_id === o.program_id || u.program_id === o.wf_id })).user_id : null,
              partof: o.provone_waspartof,
              eid: o.execution_id,
              wid: workflowIdentifier
            }
          }))
        })

        return Promise.all(promises)
      }))
    })
  })
}

Kepler.prototype.PopulatePortRelations = (workflowIdentifier) => {
  return new Promise((resolve, reject) => {
    return pg.query('select distinct case when write_event_id = -1 then 0 else 1 end as write, pe.port_id, af.actor_id from port_event pe\n' +
      'inner join actor_fire af on pe.fire_id = af.id', (err, res) => {
      if (err || res === undefined) { return reject(err) }

      let promises = []

      _.each(res.rows, (o) => {
        var replacements = {
          pid: o.port_id,
          eid: o.actor_id,
          portType: (o.write) ? 'provone_hasOutPort' : 'provone_hasInPort',
          wid: workflowIdentifier
        }

        promises.push(db.query(`UPDATE ${Provone.Classes.PORT} SET ${replacements.portType} = :eid WHERE port_id = :pid AND workflow_identifier = :wid`, { replacements: replacements }))
      })

      return resolve(Promise.all(promises))
    })
  })
}

Kepler.prototype.PopulateEntityRelations = (workflowIdentifier) => {
  return new Promise((resolve, reject) => {
    return pg.query('select distinct case when write_event_id = -1 then 0 else 1 end as write, coalesce(data, file_id, data_id) as data, fire_id as execution_id from port_event', (err, res) => {
      if (err || res === undefined) { return reject(err) }

      let promises = []

      _.each(res.rows, (o) => {
        var replacements = {
          data: o.data,
          exeid: o.execution_id,
          rtype: (o.write) ? 'prov_wasgeneratedby' : 'prov_used',
          wid: workflowIdentifier
        }

        promises.push(db.query(`UPDATE ${Prov.Classes.ENTITY} SET ${replacements.rtype} = :exeid WHERE value = :data AND workflow_identifier = :wid`, { replacements: replacements }))
      })

      return resolve(Promise.all(promises))
    })
  })
}
