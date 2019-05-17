class SQLColumn {
  projection: string;
  alias?: string;
}

class SQLTable {
  name: string;
  alias?: string;
  columns?: Array<SQLColumn>;
  where?: string;
}

class MediationEntity {
  entity1: MediationEntity | SQLTable;
  entity2?: MediationEntity | SQLTable;
  type?: string;
  columns?: Array<SQLColumn>;
  params?: Array<string>;
}
