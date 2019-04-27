import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  Unique,
  ManyToOne
} from "typeorm";

import { DataSource } from "./DataSource";

@Entity("mediator")
@Unique(["name", "dataSource"])
@Unique(["slug", "dataSource"])
export class Mediator extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("varchar")
  name: string;

  @Column("varchar")
  slug: string;

  @Column("json")
  entityMapper: JSON;

  @ManyToOne(_ => DataSource, dataSource => dataSource.mediators, {
    cascade: true
  })
  @JoinTable()
  dataSource: DataSource;
}
