import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  JoinTable,
  Unique,
  OneToMany
} from 'typeorm'

import { DataSource } from '.'

@Entity('users')
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('varchar')
  email: string

  @Column('varchar')
  password: string

  @OneToMany(_ => DataSource, ds => ds.owner)
  @JoinTable()
  dataSources: [DataSource]
}
