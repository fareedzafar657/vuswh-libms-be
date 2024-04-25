import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Language } from './language.entity';
import { Publisher } from './publisher.entity';
import { MaterialType } from './material_type.entity';
import { Category } from './category.entity';
import { Location } from './location.entity';
import { Department } from './department.entity';
import { Currency } from './currency.entity';
import { User } from './user.entity';
import { AssetsIssuance } from './assets_issuance.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ nullable: false })
  cover: string;

  @Column({ nullable: true })
  pdf: string;

  @Column({ type: 'varchar' })
  acc_no: string;

  @Column({
    type: 'varchar',
    length: 25,
  })
  call_no: string;

  @ManyToOne(() => Category, (category) => category.assets, {
    onDelete: 'SET NULL',
  })
  category: Category;

  @Column({
    type: 'varchar',
    length: 50,
    unique: false,
    nullable: false,
  })
  title: string;

  @Column({ type: 'varchar', length: 100 })
  subTitle: string;

  @Column({ type: 'varchar', length: 50 })
  author: string;

  @Column({ type: 'simple-array' })
  subAuthor: string[];

  @Column({ type: 'varchar', length: 25 })
  edition_no: string;

  @Column({ type: 'varchar', length: 25 })
  version_no: string;

  @Column({ type: 'varchar', length: 25 })
  volume_no: string;

  @Column({ type: 'varchar', length: 25 })
  ddc_classification_no: string;

  @ManyToOne(() => Publisher, (publisher) => publisher.assetPublishers, {
    onDelete: 'SET NULL',
  })
  publisher: Publisher;

  @ManyToOne(() => Publisher, (publisher) => publisher.assetDistributors, {
    nullable: true,
  })
  distributer: Publisher;

  @Column({ type: 'varchar', length: 50 })
  accompanying_material: string;

  @ManyToOne(() => MaterialType, (material_type) => material_type.assets, {
    onDelete: 'SET NULL',
  })
  material_type: MaterialType;

  @Column({ type: 'varchar', length: 25 })
  isbn_no: string;

  @Column({ type: 'varchar', length: 25 })
  issn_no: string;

  @Column({ nullable: true })
  publishing_year: number;

  @Column({ type: 'date', nullable: true })
  publishing_date: Date;

  @Column({ type: 'date', nullable: true })
  date_of_purchase: Date;

  @Column({ nullable: true, type: 'float' })
  price: number;

  @ManyToOne(() => Currency, (currency) => currency.assets, {
    onDelete: 'SET NULL',
  })
  currency: Currency;

  @Column({ type: 'int' })
  total_pages: number;

  @Column({ type: 'varchar', unique: true })
  barcode: string;

  @ManyToOne(() => Language, (language) => language.assets, {
    onDelete: 'SET NULL',
  })
  language: Language;

  @ManyToOne(() => Location, (location) => location.assets, {
    onDelete: 'SET NULL',
  })
  location: Location;

  @Column({ type: 'varchar', length: 100 })
  location_placed: string;

  @ManyToOne(() => Department, (department) => department.assets, {
    onDelete: 'SET NULL',
  })
  department: Department;

  @Column({ type: 'varchar', length: 500 })
  description: string;

  @CreateDateColumn({ nullable: false })
  created_at: Date;

  @UpdateDateColumn({ nullable: false })
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  archived_at: Date;

  @Column({ default: true, type: 'bool' })
  is_available: boolean;

  @Column({ type: 'varchar', nullable: true, length: 50 })
  donated_by: string;

  @ManyToOne(() => User, (created_by_user) => created_by_user.asset_created_by)
  created_by_user: User;

  @ManyToOne(() => User, (updated_by_user) => updated_by_user.asset_updated_by)
  updated_by_user: User;

  @ManyToOne(
    () => User,
    (archived_by_user) => archived_by_user.asset_archived_by,
  )
  archived_by_user: User;

  @OneToMany(
    () => AssetsIssuance,
    (assetsIssuance) => assetsIssuance.issued_asset,
  )
  assetIssuances: AssetsIssuance[];
}
