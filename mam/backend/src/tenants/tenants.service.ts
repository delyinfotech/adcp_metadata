import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

export class CreateTenantDto {
  name: string;
  slug: string;
  plan?: string;
  storageLimitGb?: number;
  settings?: Record<string, any>;
}

export class UpdateTenantDto {
  name?: string;
  plan?: string;
  storageLimitGb?: number;
  settings?: Record<string, any>;
  isActive?: boolean;
}

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });

    if (existing) {
      throw new ConflictException('Tenant with this slug already exists');
    }

    const tenant = this.tenantRepository.create(createTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { slug } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);
    Object.assign(tenant, updateTenantDto);
    return this.tenantRepository.save(tenant);
  }

  async updateStorageUsed(id: string, sizeInBytes: number): Promise<void> {
    const tenant = await this.findOne(id);
    const sizeInGb = sizeInBytes / (1024 * 1024 * 1024);
    tenant.storageUsedGb = Number(tenant.storageUsedGb) + sizeInGb;
    await this.tenantRepository.save(tenant);
  }

  async delete(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    tenant.isActive = false;
    await this.tenantRepository.save(tenant);
  }
}
