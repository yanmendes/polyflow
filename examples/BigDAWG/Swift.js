const Prov = require('./Prov')
const Provone = require('./Provone')

const provoneProgram = {
  name: 'script_run',
  columns: [
    {
      alias: 'swift_program_id',
      projection: 'script_run_id'
    },
    {
      alias: 'swift_label',
      projection: 'script_filename'
    }
  ]
}

const provoneExecution = {
  name: 'app_exec',
  columns: [
    {
      alias: 'swift_execution_id',
      projection: 'app_exec_id'
    },
    {
      alias: 'swift_prov_startedAtTime',
      projection: 'start_time'
    },
    {
      alias: 'swift_provone_hadPlan',
      projection: 'script_run_id'
    },
    {
      projection: 'duration'
    }
  ]
}

const provEntity = {
  name: 'file',
  columns: [
    {
      alias: 'swift_entity_id',
      projection: 'file_id'
    },
    {
      alias: 'swift_label',
      projection: 'name'
    },
    {
      alias: 'swift_entity_type',
      projection: "'provone_Document'"
    }
  ]
}

const provUsed = {
  name: 'staged_in',
  columns: [
    {
      alias: 'swift_entity_id',
      projection: 'file_id'
    },
    {
      alias: 'swift_execution_id',
      projection: 'app_exec_id'
    }
  ]
}

const provWasGeneratedBy = {
  name: 'staged_out',
  columns: [
    {
      alias: 'swift_entity_id',
      projection: 'file_id'
    },
    {
      alias: 'swift_execution_id',
      projection: 'app_exec_id'
    }
  ]
}

const entityMappers = [
  {
    name: Prov.Classes.ENTITY,
    slug: Prov.Classes.ENTITY,
    entityMapper: provEntity
  },
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
  {
    name: Prov.Relationships.USED,
    slug: Prov.Relationships.USED,
    entityMapper: provUsed
  },
  {
    name: Prov.Relationships.WASGENERATEDBY,
    slug: Prov.Relationships.WASGENERATEDBY,
    entityMapper: provWasGeneratedBy
  }
]

module.exports = entityMappers
