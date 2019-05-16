import Prov from '../models/Prov'
import Provone from '../models/Provone'
import {
  SQL_INNER_JOIN,
  SQL_UNION,
  SQL_LEFT_JOIN
} from '../mediators/mediationTypes'

const Port = {
  name: 'port',
  alias: 'p',
  columns: [
    {
      alias: 'port_id',
      projection: 'p.id'
    },
    {
      alias: 'port_type',
      projection:
        "CASE WHEN p.direction = 1 THEN 'out' WHEN p.direction = 0 THEN 'in' END"
    }
  ]
}

const Entity = {
  name: 'entity',
  alias: 'e',
  columns: [
    {
      alias: 'label',
      projection: 'e.name'
    }
  ]
}

const provonePort = {
  entity1: Port,
  entity2: Entity,
  type: SQL_INNER_JOIN,
  columns: { ...Port.columns, ...Entity.columns },
  params: ['p.id', 'e.id']
}

const Parameter = {
  name: 'parameter',
  alias: 'param',
  columns: [
    {
      alias: 'entity_id',
      projection: 'param.id'
    },
    {
      alias: 'type',
      projection: 'param.type'
    },
    {
      alias: 'value',
      projection: 'param.value'
    },
    {
      alias: 'entity_type',
      projection: "'provone_Data'"
    }
  ]
}

const AssociatedData = {
  name: 'associated_data',
  alias: 'ad',
  columns: [
    {
      alias: 'label',
      projection: 'ad.name'
    }
  ]
}

const Data = {
  name: 'data',
  alias: 'd',
  columns: [
    {
      alias: 'value',
      projection: 'd.md5'
    }
  ]
}

const provEntity = {
  entity1: {
    entity1: Parameter,
    entity2: Entity,
    type: SQL_INNER_JOIN,
    columns: { ...Parameter.columns, ...Entity.columns },
    params: ['param.id', 'e.id']
  },
  entity2: {
    entity1: Data,
    entity2: AssociatedData,
    type: SQL_LEFT_JOIN,
    params: ['d.md5', 'ad.data_id'],
    columns: [
      {
        alias: 'entity_id',
        projection: 'NULL'
      },
      {
        alias: 'type',
        projection: "'md5'"
      },
      ...Data.columns,
      {
        alias: 'entity_type',
        projection: "'provone_Data'"
      },
      ...AssociatedData.columns
    ]
  },
  type: SQL_UNION
}

const Actor = {
  name: 'actor',
  alias: 'a',
  columns: [
    {
      alias: 'program_id',
      projection: 'a.id'
    }
  ]
}
const Workflow = { name: 'workflow', alias: 'w' }

const provoneProgram = {
  entity1: Actor,
  entity2: {
    entity1: Entity,
    entity2: Workflow,
    type: SQL_LEFT_JOIN,
    columns: [
      {
        alias: 'joinId',
        projection: 'e.id'
      },
      {
        alias: 'label',
        projection: 'COALESCE(w.name, e.name)'
      },
      {
        alias: 'ipw',
        projection: 'CASE WHEN w.id IS NOT NULL THEN TRUE ELSE FALSE END'
      },
      {
        alias: 'phssubp',
        projection: 'CASE WHEN w.id IS NOT NULL THEN NULL ELSE e.wf_id END'
      }
    ],
    params: ['w.id', 'e.id']
  },
  columns: [
    {
      alias: 'program_id',
      projection: 'program_id'
    },
    {
      alias: 'label',
      projection: 'label'
    },
    {
      alias: 'is_provone_Workflow',
      projection: 'ipw'
    },
    {
      alias: 'provone_hasSubProgram',
      projection: 'phssubp'
    }
  ],
  type: SQL_INNER_JOIN,
  params: ['program_id', 'joinId']
}

const ActorFire = {
  name: 'actor_fire',
  alias: 'af',
  columns: [
    {
      alias: 'execution_id',
      projection: 'af.id'
    },
    {
      alias: 'prov_hadPlan',
      projection: 'actor_id'
    },
    {
      alias: 'prov_startedAtTime',
      projection: 'af.start_time'
    },
    {
      alias: 'prov_endedAtTime',
      projection: 'af.end_time'
    },
    {
      alias: 'provone_wasPartOf',
      projection: 'af.wf_exec_id'
    }
  ]
}

const WorkflowExec = {
  name: 'workflow_exec',
  alias: 'wfe',
  columns: [
    {
      alias: 'execution_id',
      projection: 'NULL'
    },
    {
      alias: 'prov_hadPlan',
      projection: 'wfe.wf_id'
    },
    {
      alias: 'prov_startedAtTime',
      projection: 'wfe.start_time'
    },
    {
      alias: 'prov_endedAtTime',
      projection: 'wfe.end_time'
    },
    {
      alias: 'provone_wasPartOf',
      projection: 'wfe.wf_exec_id'
    },
    {
      alias: 'prov_wasAssociatedWith',
      projection: "wfe.'USER'"
    }
  ]
}

const provoneExecution = {
  entity1: {
    ...ActorFire,
    columns: [
      ...ActorFire.columns.filter(({ alias }) =>
        [
          'execution_id',
          'prov_startedAtTime',
          'prov_endedAtTime',
          'provone_wasPartOf'
        ].includes(alias)
      ),
      {
        alias: 'prov_wasAssociatedWith',
        projection: 'NULL'
      }
    ]
  },
  entity2: {
    ...WorkflowExec,
    columns: [
      ...WorkflowExec.columns.filter(({ alias }) =>
        [
          'execution_id',
          'prov_startedAtTime',
          'prov_endedAtTime',
          'provone_wasPartOf',
          'prov_wasAssociatedWith'
        ].includes(alias)
      )
    ]
  },
  type: SQL_UNION
}

const provAssociation = {
  entity1: {
    ...ActorFire,
    columns: [
      ...ActorFire.columns.filter(({ alias }) =>
        ['execution_id', 'prov_hadPlan'].includes(alias)
      )
    ]
  },
  entity2: {
    ...WorkflowExec,
    columns: [
      ...WorkflowExec.columns.filter(({ alias }) =>
        ['execution_id', 'prov_hadPlan'].includes(alias)
      )
    ]
  },
  type: SQL_UNION
}

const provUsage = {
  name: 'port_event',
  alias: 'pe',
  columns: [
    {
      alias: 'execution_id',
      projection: 'pe.fire_id'
    },
    {
      alias: 'provone_hadInPort',
      projection: 'pe.port_id'
    },
    {
      alias: 'data',
      projection: 'data'
    }
  ],
  where: `pe.write_event_id = -1`
}

const provGeneration = {
  name: 'port_event',
  alias: 'pe',
  columns: [
    {
      alias: 'execution_id',
      projection: 'pe.fire_id'
    },
    {
      alias: 'provone_hadInPort',
      projection: 'pe.port_id'
    },
    {
      alias: 'data',
      projection: 'data'
    }
  ],
  where: `pe.write_event_id != -1`
}

const provoneUser = {
  name: 'workflow_exec',
  alias: 'we',
  columns: [
    {
      alias: 'label',
      projection: "we.'USER'"
    },
    {
      alias: 'program_id',
      projection: 'we.wf_id'
    }
  ]
}

export default new Map([
  [Provone.Classes.PORT, provonePort],
  [Prov.Classes.ENTITY, provEntity],
  [Provone.Classes.PROGRAM, provoneProgram],
  [Provone.Classes.EXECUTION, provoneExecution],
  [Prov.Classes.ASSOCIATION, provAssociation],
  [Prov.Classes.USAGE, provUsage],
  [Prov.Classes.GENERATION, provGeneration],
  [Provone.Classes.USER, provoneUser]
])
