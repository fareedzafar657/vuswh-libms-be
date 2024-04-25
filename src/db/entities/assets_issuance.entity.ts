import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Asset } from './assets.entity';

@Entity('assets_issuance')
export class AssetsIssuance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.assetIssuances, { nullable: false })
  issued_asset: Asset;

  @ManyToOne(() => User, (user) => user.assetBorrowers, { nullable: false })
  borrower: User;

  @Column({ type: 'date', nullable: false })
  due_date: Date;

  @Column({ type: 'date', nullable: true })
  re_due_date: Date;

  @ManyToOne(() => User, (user) => user.assetIssuers, { nullable: true }) // false
  issued_by: User;

  @ManyToOne(() => User, (user) => user.assetReIssuers, { nullable: true }) // false
  re_issued_by: User;

  @Column({ type: 'datetime', nullable: true })
  return_date: Date;

  @Column({ type: 'varchar', length: 250, nullable: true })
  remarks_on_return_condition: string;

  @Column({ type: 'double', nullable: true })
  fine_amount: number;

  @ManyToOne(() => User, (user) => user.assetReturners, { nullable: true })
  returned_by: User;

  @CreateDateColumn({ nullable: false })
  create_at: Date;

  @UpdateDateColumn({ nullable: false })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  archived_at: Date;

  @Column({ default: false, type: 'bool' })
  re_issued: boolean;
}
