import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Permission } from './permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 25,
    unique: true,
    nullable: false,
  })
  name: string;

  @Column({
    default: false,
  })
  is_default: boolean;

  @CreateDateColumn({
    nullable: false,
  })
  created_at: Date;

  @UpdateDateColumn({
    nullable: false,
  })
  updated_at: Date;

  @DeleteDateColumn({
    nullable: true,
  })
  archived_at: Date;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
