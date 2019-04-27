import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  ManyToOne,
  Unique
} from "typeorm";

import { Workspace } from "./Workspace";

enum Type {
  Postgres = "postgres"
}

@Entity("data_source")
@Unique(["uri", "workspace"])
export class DataSource extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  uri: string;

  @Column("text")
  type: Type;

  @ManyToOne(_ => Workspace, workspace => workspace.dataSources, {
    cascade: true
  })
  @JoinTable()
  workspace: Workspace;
}
