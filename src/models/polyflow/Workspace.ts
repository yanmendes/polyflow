import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable
} from "typeorm";
import { User } from "./User";

@Entity("workspaces")
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: string;

  @ManyToMany(_ => User, user => user.workspaces)
  @JoinTable()
  users: User[];
}
