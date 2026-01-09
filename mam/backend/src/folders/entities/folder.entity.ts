import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Asset } from '../../assets/entities/asset.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true, name: 'parent_folder_id' })
  parentFolderId: string;

  @Column({ type: 'text' })
  path: string;

  @Column({ type: 'integer', default: 0 })
  depth: number;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'created_by' })
  createdById: string;

  @Column({ type: 'jsonb', nullable: true, name: 'custom_metadata' })
  customMetadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Folder, (folder) => folder.children, { nullable: true })
  @JoinColumn({ name: 'parent_folder_id' })
  parent: Folder;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[];

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => Asset, (asset) => asset.folder)
  assets: Asset[];
}
