import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('permissions')
@Tree('nested-set')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  name: string;

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

  //Parent ID column with selfjoin

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable()
  roles: Role[];

  @ManyToMany(() => User, (user) => user.permissions)
  @JoinTable()
  users: User[];

  // @ManyToOne(() => Permission, (permission) => permission.childrens, {
  //   nullable: true,
  // })
  @TreeParent()
  parent: Permission;

  // @OneToMany(() => Permission, (permission) => permission.parent)
  @TreeChildren()
  children: Permission[];
}
