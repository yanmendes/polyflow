import Prov from "../models/Prov";
import Provone from "../models/Provone";
import {
  SQL_INNER_JOIN,
  SQL_UNION,
  SQL_LEFT_JOIN
} from "../mediators/mediationTypes";
import * as lodash from "lodash";

const filterObjectByKeys = (object: any, allowed: Array<any>): Object =>
  lodash.pick(object, allowed);

const Port = {
  name: "port",
  alias: "p",
  columns: {
    port_id: "p.id",
    port_type: `CASE WHEN p.direction = 1 THEN 'out' WHEN p.direction = 0 THEN 'in' END`
  }
};
const Entity = { name: "entity", alias: "e", columns: { label: "e.name" } };

const provonePort = {
  entity1: Port,
  entity2: Entity,
  type: SQL_INNER_JOIN,
  columns: { ...Port.columns, ...Entity.columns },
  params: ["p.id", "e.id"]
};

const Parameter = {
  name: "parameter",
  alias: "param",
  columns: {
    entity_id: "param.id",
    type: "param.type",
    value: "param.value",
    entity_type: `'provone_Data'`
  }
};
const AssociatedData = {
  name: "associated_data",
  alias: "ad",
  columns: { label: "ad.name" }
};
const Data = { name: "data", alias: "d", columns: { value: "d.md5" } };

const provEntity = {
  entity1: {
    entity1: Parameter,
    entity2: Entity,
    type: SQL_INNER_JOIN,
    columns: { ...Parameter.columns, ...Entity.columns },
    params: ["param.id", "e.id"]
  },
  entity2: {
    entity1: Data,
    entity2: AssociatedData,
    type: SQL_LEFT_JOIN,
    params: ["d.md5", "ad.data_id"],
    columns: {
      entity_id: "NULL",
      type: `'md5'`,
      ...Data.columns,
      entity_type: `'provone_Data'`,
      ...AssociatedData.columns
    }
  },
  type: SQL_UNION
};

const Actor = { name: "actor", alias: "a", columns: { program_id: "a.id" } };
const Workflow = { name: "workflow", alias: "w" };

const provoneProgram = {
  entity1: Actor,
  entity2: {
    entity1: Entity,
    entity2: Workflow,
    type: SQL_LEFT_JOIN,
    columns: {
      joinId: `e.id`,
      label: `COALESCE(w.name, e.name)`,
      ipw: `CASE WHEN w.id IS NOT NULL THEN TRUE ELSE FALSE END`,
      phssubp: `CASE WHEN w.id IS NOT NULL THEN NULL ELSE e.wf_id END`
    },
    params: ["w.id", "e.id"]
  },
  columns: {
    program_id: "program_id",
    label: "label",
    is_provone_Workflow: "ipw",
    provone_hasSubProgram: "phssubp"
  },
  type: SQL_INNER_JOIN,
  params: ["program_id", "joinId"]
};

const ActorFire = {
  name: "actor_fire",
  alias: "af",
  columns: {
    execution_id: "af.id",
    prov_hadPlan: "actor_id",
    prov_startedAtTime: `TO_CHAR(af.start_time, 'dd-mon-yyyy hh24:mi:ss')`,
    prov_endedAtTime: `TO_CHAR(af.end_time, 'dd-mon-yyyy hh24:mi:ss')`
  }
};

const WorkflowExec = {
  name: "workflow_exec",
  alias: "wfe",
  columns: {
    execution_id: "NULL",
    prov_hadPlan: "wfe.wf_id",
    prov_startedAtTime: `TO_CHAR(wfe.start_time, 'dd-mon-yyyy hh24:mi:ss')`,
    prov_endedAtTime: `TO_CHAR(wfe.end_time, 'dd-mon-yyyy hh24:mi:ss')`
  }
};

const provoneExecution = {
  entity1: {
    ...ActorFire,
    columns: filterObjectByKeys(ActorFire.columns, [
      "execution_id",
      "prov_startedAtTime",
      "prov_endedAtTime"
    ])
  },
  entity2: {
    ...WorkflowExec,
    columns: filterObjectByKeys(WorkflowExec.columns, [
      "execution_id",
      "prov_startedAtTime",
      "prov_endedAtTime"
    ])
  },
  type: SQL_UNION
};

const provAssociation = {
  entity1: {
    ...ActorFire,
    columns: filterObjectByKeys(ActorFire.columns, [
      "execution_id",
      "prov_hadPlan"
    ])
  },
  entity2: {
    ...WorkflowExec,
    columns: filterObjectByKeys(WorkflowExec.columns, [
      "execution_id",
      "prov_hadPlan"
    ])
  },
  type: SQL_UNION
};

export default new Map<string, MediationEntity | SQLTable>([
  [Provone.Classes.PORT, provonePort],
  [Prov.Classes.ENTITY, provEntity],
  [Provone.Classes.PROGRAM, provoneProgram],
  [Provone.Classes.EXECUTION, provoneExecution],
  [Prov.Classes.ASSOCIATION, provAssociation]
]);

/*
var Kepler = function () {

}

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
        let replacements = {
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
        let replacements = {
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
*/
