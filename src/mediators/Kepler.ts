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
    prov_endedAtTime: `TO_CHAR(af.end_time, 'dd-mon-yyyy hh24:mi:ss')`,
    provone_wasPartOf: "af.wf_exec_id"
  }
};

const WorkflowExec = {
  name: "workflow_exec",
  alias: "wfe",
  columns: {
    execution_id: "NULL",
    prov_hadPlan: "wfe.wf_id",
    prov_startedAtTime: `TO_CHAR(wfe.start_time, 'dd-mon-yyyy hh24:mi:ss')`,
    prov_endedAtTime: `TO_CHAR(wfe.end_time, 'dd-mon-yyyy hh24:mi:ss')`,
    prov_wasAssociatedWith: `wfe."USER"`,
    provone_wasPartOf: "wfe.wf_id"
  }
};

const provoneExecution = {
  entity1: {
    ...ActorFire,
    columns: {
      ...filterObjectByKeys(ActorFire.columns, [
        "execution_id",
        "prov_startedAtTime",
        "prov_endedAtTime",
        "provone_wasPartOf"
      ]),
      prov_wasAssociatedWith: null
    }
  },
  entity2: {
    ...WorkflowExec,
    columns: filterObjectByKeys(WorkflowExec.columns, [
      "execution_id",
      "prov_startedAtTime",
      "prov_endedAtTime",
      "provone_wasPartOf",
      "prov_wasAssociatedWith"
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

const provUsage = {
  name: "port_event",
  alias: "pe",
  columns: {
    execution_id: "pe.fire_id",
    provone_hadInPort: "pe.port_id",
    data: `data`
  },
  where: `pe.write_event_id = -1`
};

const provGeneration = {
  name: "port_event",
  alias: "pe",
  columns: {
    execution_id: "pe.fire_id",
    provone_hadInPort: "pe.port_id",
    data: `data`
  },
  where: `pe.write_event_id != -1`
};

const provoneUser = {
  name: "workflow_exec",
  alias: "we",
  columns: {
    label: `we."USER"`,
    program_id: "we.wf_id"
  }
};

export default new Map<string, MediationEntity | SQLTable>([
  [Provone.Classes.PORT, provonePort],
  [Prov.Classes.ENTITY, provEntity],
  [Provone.Classes.PROGRAM, provoneProgram],
  [Provone.Classes.EXECUTION, provoneExecution],
  [Prov.Classes.ASSOCIATION, provAssociation],
  [Prov.Classes.USAGE, provUsage],
  [Prov.Classes.GENERATION, provGeneration],
  [Provone.Classes.USER, provoneUser]
]);

/*
Kepler.prototype.execute = (workflowIdentifier) => {
    return Kepler.prototype.PopulatePortRelations(workflowIdentifier)
  }).then(() => {
    return Kepler.prototype.PopulateEntityRelations(workflowIdentifier)
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
