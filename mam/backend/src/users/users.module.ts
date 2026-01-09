import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { UsersController } from './users.controller';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), TenantsModule],
  controllers: [UsersController],
  providers: [UsersService, RolesService],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
