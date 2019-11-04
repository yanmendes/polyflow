import {
  Entity as TypeORMEntity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  Unique,
  ManyToOne,
  OneToMany
} from 'typeorm'

import { DataSource, Entity } from '.'

@TypeORMEntity('mediator')
@Unique(['name', 'dataSource'])
@Unique(['slug', 'dataSource'])
export class Mediator extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  name: string

  @Column('varchar')
  slug: string

  @OneToMany(_ => Entity, entity => entity.mediator)
  @JoinTable()
  entities: [Entity]

  @ManyToOne(_ => DataSource, dataSource => dataSource.mediators, {
    cascade: true
  })
  @JoinTable()
  dataSource: DataSource
}
