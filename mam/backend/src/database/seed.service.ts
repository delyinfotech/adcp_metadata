import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantsService } from '../tenants/tenants.service';
import { RolesService } from '../users/roles.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private tenantsService: TenantsService,
    private rolesService: RolesService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const nodeEnv = this.configService.get<string>('nodeEnv');

    // Only seed in development mode or if explicitly enabled
    if (nodeEnv === 'development' || process.env.ENABLE_SEEDING === 'true') {
      this.logger.log('Starting database seeding...');
      await this.seed();
    }
  }

  async seed() {
    try {
      // Seed default roles
      await this.seedRoles();

      // Seed default tenant
      await this.seedDefaultTenant();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error(`Database seeding failed: ${error.message}`, error.stack);
    }
  }

  private async seedRoles() {
    this.logger.log('Seeding default roles...');

    await this.rolesService.seedDefaultRoles();

    this.logger.log('Default roles seeded successfully');
  }

  private async seedDefaultTenant() {
    this.logger.log('Seeding default tenant...');

    try {
      // Check if default tenant exists
      let tenant;
      try {
        tenant = await this.tenantsService.findBySlug('demo');
      } catch (error) {
        // Tenant doesn't exist, create it
        tenant = await this.tenantsService.create({
          name: 'Demo Organization',
          slug: 'demo',
          plan: 'professional',
          storageLimitGb: 1000,
          settings: {
            features: {
              aiExtraction: true,
              workflows: true,
              analytics: true,
            },
          },
        });
        this.logger.log(`Created default tenant: ${tenant.id}`);
      }

      // Create admin user if it doesn't exist
      const adminEmail = 'admin@demo.mediax.ai';
      let adminUser;

      try {
        adminUser = await this.usersService.findByEmail(adminEmail);
      } catch (error) {
        // User doesn't exist, create it
        const adminRole = await this.rolesService.findBySlug('admin');

        if (!adminRole) {
          this.logger.error('Admin role not found. Cannot create admin user.');
          return;
        }

        adminUser = await this.usersService.create({
          email: adminEmail,
          password: 'Admin123!',
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          tenantId: tenant.id,
          roleId: adminRole.id,
        });

        this.logger.log(`Created admin user: ${adminUser.email}`);
        this.logger.log('Default admin credentials: admin@demo.mediax.ai / Admin123!');
      }

      this.logger.log('Default tenant and admin user ready');
    } catch (error) {
      this.logger.error(`Failed to seed default tenant: ${error.message}`, error.stack);
    }
  }
}
