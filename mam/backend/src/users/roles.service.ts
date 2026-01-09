import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

export class CreateRoleDto {
  name: string;
  slug: string;
  permissions: string[];
  tenantId?: string;
  description?: string;
  isSystemRole?: boolean;
}

export class UpdateRoleDto {
  name?: string;
  permissions?: string[];
  description?: string;
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.roleRepository.findOne({
      where: {
        slug: createRoleDto.slug,
        tenantId: createRoleDto.tenantId || null,
      },
    });

    if (existing) {
      throw new ConflictException('Role with this slug already exists for this tenant');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async findAll(tenantId?: string): Promise<Role[]> {
    const where = tenantId ? [{ tenantId }, { isSystemRole: true }] : {};
    return this.roleRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async findBySlug(slug: string, tenantId?: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { slug, tenantId: tenantId || null },
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (role.isSystemRole) {
      throw new ConflictException('Cannot update system roles');
    }

    Object.assign(role, updateRoleDto);
    return this.roleRepository.save(role);
  }

  async delete(id: string): Promise<void> {
    const role = await this.findOne(id);

    if (role.isSystemRole) {
      throw new ConflictException('Cannot delete system roles');
    }

    await this.roleRepository.delete(id);
  }

  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'Admin',
        slug: 'admin',
        permissions: ['*'],
        description: 'Full system access',
        isSystemRole: true,
      },
      {
        name: 'Manager',
        slug: 'manager',
        permissions: [
          'asset.*',
          'folder.*',
          'collection.*',
          'workflow.create',
          'workflow.approve',
          'workflow.reject',
        ],
        description: 'Manage assets and workflows',
        isSystemRole: true,
      },
      {
        name: 'Creator',
        slug: 'creator',
        permissions: [
          'asset.create',
          'asset.read',
          'asset.update',
          'asset.delete',
          'folder.create',
          'folder.read',
          'collection.create',
          'collection.read',
        ],
        description: 'Create and manage own assets',
        isSystemRole: true,
      },
      {
        name: 'Reviewer',
        slug: 'reviewer',
        permissions: [
          'asset.read',
          'workflow.approve',
          'workflow.reject',
          'comment.create',
        ],
        description: 'Review and approve assets',
        isSystemRole: true,
      },
      {
        name: 'Viewer',
        slug: 'viewer',
        permissions: ['asset.read', 'folder.read', 'collection.read'],
        description: 'View and download assets',
        isSystemRole: true,
      },
    ];

    for (const roleData of defaultRoles) {
      const existing = await this.findBySlug(roleData.slug);
      if (!existing) {
        await this.create(roleData);
      }
    }
  }
}
