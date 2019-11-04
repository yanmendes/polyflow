export class SQLColumn {
  projection: string
  alias?: string
}

export class SQLTable {
  name: string
  alias?: string
  columns?: Array<SQLColumn>
  where?: string
}

export class MediationEntity {
  entity1: MediationEntity | SQLTable
  entity2?: MediationEntity | SQLTable
  type?: string
  columns?: Array<SQLColumn>
  params?: Array<string>
}
