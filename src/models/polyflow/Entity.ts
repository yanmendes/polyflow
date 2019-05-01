import {
  Entity as TypeORMEntity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  ManyToOne,
  Unique
} from "typeorm";

import { Mediator } from ".";

@TypeORMEntity("entity")
@Unique(["name", "mediator"])
@Unique(["slug", "mediator"])
export class Entity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: String;

  @Column("text")
  slug: String;

  @Column("json")
  entityMapper: JSON;

  @ManyToOne(_ => Mediator, mediator => mediator.entities, {
    cascade: true
  })
  @JoinTable()
  mediator: Mediator;
}
