import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asset } from './assets.entity';

@Entity('publishers')
export class Publisher {
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

  @OneToMany(() => Asset, (asset) => asset.publisher)
  assetPublishers: Asset[];

  @OneToMany(() => Asset, (asset) => asset.distributer)
  assetDistributors: Asset[];
}
