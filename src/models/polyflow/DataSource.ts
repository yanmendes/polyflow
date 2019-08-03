import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinTable, Unique } from "typeorm";

import { Mediator } from ".";

enum Type {
  Postgres = "postgres",
  Mysql = "mysql",
  BigDawg = "bigdawg"
}

@Entity("data_source")
@Unique(["uri"])
export class DataSource extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  uri: string;

  @Column("text")
  slug: string;

  @Column("text")
  type: Type;

  @JoinTable()
  mediators: [Mediator];
}
