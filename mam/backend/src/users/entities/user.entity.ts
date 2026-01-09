import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Role } from './role.entity';
import { Asset } from '../../assets/entities/asset.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  username: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, default: 'local', name: 'auth_provider' })
  authProvider: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ type: 'text', nullable: true, name: 'avatar_url' })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  tenantId: string;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_email_verified' })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: false, name: 'mfa_enabled' })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'mfa_secret' })
  mfaSecret: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.users)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Asset, (asset) => asset.createdBy)
  createdAssets: Asset[];
}
