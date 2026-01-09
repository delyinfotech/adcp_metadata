import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Folder } from '../../folders/entities/folder.entity';

export enum AssetType {
  VIDEO = 'video',
  IMAGE = 'image',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum AssetStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, unique: true, name: 'asset_key' })
  assetKey: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, name: 'asset_type' })
  assetType: AssetType;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize: number;

  @Column({ type: 'integer', nullable: true })
  duration: number;

  @Column({ type: 'integer', nullable: true })
  width: number;

  @Column({ type: 'integer', nullable: true })
  height: number;

  @Column({ type: 'varchar', length: 100 })
  bucket: string;

  @Column({ type: 'varchar', length: 50, default: 'STANDARD', name: 'storage_class' })
  storageClass: string;

  @Column({ type: 'text', nullable: true, name: 'cdn_url' })
  cdnUrl: string;

  @Column({ type: 'uuid', nullable: true, name: 'folder_id' })
  folderId: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'created_by' })
  createdById: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedById: string;

  @Column({ type: 'varchar', length: 50, default: AssetStatus.PROCESSING })
  status: AssetStatus;

  @Column({ type: 'integer', default: 0, name: 'processing_progress' })
  processingProgress: number;

  @Column({ type: 'text', array: true, default: '{}', name: 'ai_tags' })
  aiTags: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'ai_objects' })
  aiObjects: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'ai_faces' })
  aiFaces: Record<string, any>;

  @Column({ type: 'text', nullable: true, name: 'ai_transcript' })
  aiTranscript: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'ai_sentiment' })
  aiSentiment: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'ai_safety_score' })
  aiSafetyScore: number;

  @Column({ type: 'jsonb', nullable: true, name: 'ai_features' })
  aiFeatures: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'custom_metadata' })
  customMetadata: Record<string, any>;

  @Column({ type: 'integer', default: 1 })
  version: number;

  @Column({ type: 'uuid', nullable: true, name: 'parent_asset_id' })
  parentAssetId: string;

  @Column({ type: 'boolean', default: true, name: 'is_latest_version' })
  isLatestVersion: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => Folder, (folder) => folder.assets, { nullable: true })
  @JoinColumn({ name: 'folder_id' })
  folder: Folder;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.createdAssets)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: User;
}
