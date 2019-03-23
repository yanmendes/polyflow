import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable
} from "typeorm";
import { Workspace } from "./Workspace";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  email: string;

  @Column("text")
  password: string;

  @ManyToMany(_ => Workspace, workspace => workspace.users, {
    cascade: true
  })
  @JoinTable()
  workspaces: Workspace[];
}
