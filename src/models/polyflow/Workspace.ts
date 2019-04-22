import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany
} from "typeorm";
import { User, DataSource } from ".";

@Entity("workspaces")
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: string;

  @ManyToMany(_ => User, user => user.workspaces)
  @JoinTable()
  users: User[];

  @OneToMany(_ => User, user => user.workspaces)
  @JoinTable()
  dataSources: DataSource[];
}
