import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TenantsModule } from '../tenants/tenants.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TenantsModule, UsersModule],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
