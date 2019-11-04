import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  Unique,
  OneToMany,
  ManyToOne
} from 'typeorm'

import { Mediator, User } from '.'

enum Type {
  Postgres = 'postgres',
  Mysql = 'mysql',
  BigDawg = 'bigdawg'
}

@Entity('data_source')
@Unique(['uri'])
export class DataSource extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  uri: string

  @Column('text')
  slug: string

  @Column('text')
  type: Type

  @OneToMany(_ => Mediator, mediator => mediator.dataSource)
  @JoinTable()
  mediators: [Mediator]

  @ManyToOne(_ => User, u => u.dataSources, { cascade: true })
  @JoinTable()
  owner: User
}
