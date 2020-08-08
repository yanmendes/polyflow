const Prov = require('./Prov')
const Provone = require('./Provone')

const Port = {
  name: 'port',
  alias: 'p',
  columns: [
    {
      alias: 'kepler_port_id',
      projection: 'p.id'
    },
    {
      alias: 'kepler_port_type',
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
      alias: 'kepler_label',
      projection: 'e.name'
    }
  ]
}

const provonePort = {
  entity1: Port,
  entity2: Entity,
  type: 'INNER',
  columns: [...Port.columns, ...Entity.columns],
  params: ['p.id', 'e.id']
}

const Parameter = {
  name: 'parameter',
  alias: 'param',
  columns: [
    {
      alias: 'kepler_entity_id',
      projection: 'param.id'
    },
    {
      alias: 'kepler_type',
      projection: 'param.type'
    },
    {
      alias: 'kepler_value',
      projection: 'param.value'
    },
    {
      alias: 'kepler_entity_type',
      projection: "'provone_Data'"
    }
  ]
}

const AssociatedData = {
  name: 'associated_data',
  alias: 'ad',
  columns: [
    {
      alias: 'kepler_label',
      projection: 'ad.name'
    }
  ]
}

const Data = {
  name: 'data',
  alias: 'd',
  columns: [
    {
      alias: 'kepler_value',
      projection: 'd.md5'
    }
  ]
}

const provEntity = {
  entity1: {
    entity1: Parameter,
    entity2: Entity,
    type: 'INNER',
    columns: [...Parameter.columns, ...Entity.columns],
    params: ['param.id', 'e.id']
  },
  entity2: {
    entity1: Data,
    entity2: AssociatedData,
    type: 'LEFT',
    params: ['d.md5', 'ad.data_id'],
    columns: [
      {
        alias: 'kepler_entity_id',
        projection: 0
      },
      {
        alias: 'kepler_type',
        projection: "'md5'"
      },
      ...Data.columns,
      {
        alias: 'kepler_entity_type',
        projection: "'provone_Data'"
      },
      ...AssociatedData.columns
    ]
  },
  type: 'UNION'
}

const Actor = {
  name: 'actor',
  alias: 'a',
  columns: [
    {
      alias: 'kepler_program_id',
      projection: 'a.id'
    }
  ]
}

const provoneProgram = {
  entity1: Actor,
  entity2: Entity,
  columns: [
    {
      alias: 'kepler_program_id',
      projection: 'a.id'
    },
    {
      alias: 'kepler_label',
      projection: 'e.name'
    }
  ],
  type: 'INNER',
  params: ['a.id', 'e.id']
}

const ActorFire = {
  name: 'actor_fire',
  alias: 'af',
  columns: [
    {
      alias: 'kepler_execution_id',
      projection: 'af.id'
    },
    {
      alias: 'kepler_provone_hadPlan',
      projection: 'actor_id'
    },
    {
      alias: 'kepler_prov_startedAtTime',
      projection: 'af.start_time'
    },
    {
      alias: 'kepler_prov_endedAtTime',
      projection: 'af.end_time'
    },
    {
      alias: 'kepler_provone_wasPartOf',
      projection: 'af.wf_exec_id'
    }
  ]
}

const provoneExecution = {
  ...ActorFire,
  columns: ActorFire.columns.filter(({ alias }) =>
    [
      'kepler_execution_id',
      'kepler_prov_startedAtTime',
      'kepler_prov_endedAtTime',
      'kepler_provone_wasPartOf',
      'kepler_provone_hadPlan'
    ].includes(alias)
  )
}

const provUsage = {
  name: 'port_event',
  alias: 'pe',
  columns: [
    {
      alias: 'kepler_execution_id',
      projection: 'pe.fire_id'
    },
    {
      alias: 'kepler_provone_hadInPort',
      projection: 'pe.port_id'
    },
    {
      alias: 'kepler_data',
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
      alias: 'kepler_execution_id',
      projection: 'pe.fire_id'
    },
    {
      alias: 'kepler_provone_hadInPort',
      projection: 'pe.port_id'
    },
    {
      alias: 'kepler_data',
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
      alias: 'kepler_program_id',
      projection: 'we.wf_id'
    }
  ]
}

const entityMappers = [
  {
    name: Provone.Classes.PORT,
    slug: Provone.Classes.PORT,
    entityMapper: provonePort
  },
  // BigDAWG query is broken
  // {
  //   name: Prov.Classes.ENTITY,
  //   slug: Prov.Classes.ENTITY,
  //   entityMapper: provEntity
  // },
  {
    name: Provone.Classes.PROGRAM,
    slug: Provone.Classes.PROGRAM,
    entityMapper: provoneProgram
  },
  {
    name: Provone.Classes.EXECUTION,
    slug: Provone.Classes.EXECUTION,
    entityMapper: provoneExecution
  },
  // {
  //   name: Prov.Classes.ASSOCIATION,
  //   slug: Prov.Classes.ASSOCIATION,
  //   entityMapper: provAssociation
  // },
  {
    name: Prov.Classes.USAGE,
    slug: Prov.Classes.USAGE,
    entityMapper: provUsage
  },
  {
    name: Prov.Classes.GENERATION,
    slug: Prov.Classes.GENERATION,
    entityMapper: provGeneration
  },
  {
    name: Provone.Classes.USER,
    slug: Provone.Classes.USER,
    entityMapper: provoneUser
  }
]

module.exports = entityMappers
