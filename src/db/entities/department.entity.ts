import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Asset } from './assets.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 256,
    unique: true,
    nullable: false,
  })
  name: string;

  @CreateDateColumn({ nullable: false })
  created_at: Date;

  @UpdateDateColumn({ nullable: false })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  archived_at: Date;

  @OneToMany(() => User, (user) => user.department)
  staff: User[];

  @OneToMany(() => Asset, (asset) => asset.department)
  assets: Asset[];
}
