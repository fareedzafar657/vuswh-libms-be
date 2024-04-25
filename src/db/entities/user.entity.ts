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
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { Designation } from './designation.entity';
import { Department } from './department.entity';
import { Asset } from './assets.entity';
import { AssetsIssuance } from './assets_issuance.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 5,
    unique: true,
    nullable: false,
  })
  employee_id: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 13,
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  tel_ext: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({ default: false })
  is_active: boolean;

  @CreateDateColumn({ nullable: false })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  archived_at: Date;

  @Column({ default: false })
  is_validated: boolean;

  @Column({ nullable: true })
  reset_password_code: string;

  @Column({ nullable: true })
  reset_code_upto: Date;

  @Column({ type: 'text', nullable: true })
  login_token: string;

  @ManyToOne(() => Designation, (designation) => designation.users, {
    onDelete: 'SET NULL',
  })
  designation: Designation;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @ManyToMany(() => Permission, (permission) => permission.users)
  permissions: Permission[];

  @ManyToOne(() => Department, (department) => department.staff, {
    onDelete: 'SET NULL',
  })
  department: Department;

  @OneToMany(() => Asset, (asset) => asset.created_by_user)
  asset_created_by: Asset[];

  @OneToMany(() => Asset, (asset) => asset.updated_by_user)
  asset_updated_by: Asset[];

  @OneToMany(() => Asset, (asset) => asset.archived_by_user)
  asset_archived_by: Asset[];

  @OneToMany(() => AssetsIssuance, (assetsIssuance) => assetsIssuance.borrower)
  assetBorrowers: AssetsIssuance[];

  @OneToMany(
    () => AssetsIssuance,
    (assetsIssuance) => assetsIssuance.re_issued_by,
  )
  assetReIssuers: AssetsIssuance[];

  @OneToMany(() => AssetsIssuance, (assetsIssuance) => assetsIssuance.issued_by)
  assetIssuers: AssetsIssuance[];

  @OneToMany(
    () => AssetsIssuance,
    (assetsIssuance) => assetsIssuance.returned_by,
  )
  assetReturners: AssetsIssuance[];

  @ManyToOne(() => User, (user) => user.created_user, {
    nullable: true,
  })
  created_by: User;

  @OneToMany(() => User, (user) => user.created_by)
  created_user: User[];

  @ManyToOne(() => User, (user) => user.updated_user)
  updated_by: User;

  @OneToMany(() => User, (user) => user.updated_by)
  updated_user: User[];

  @ManyToOne(() => User, (user) => user.archived_user)
  archived_by: User;

  @OneToMany(() => User, (user) => user.archived_by)
  archived_user: User[];
}
