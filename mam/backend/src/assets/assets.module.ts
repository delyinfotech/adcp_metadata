import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asset } from './entities/asset.entity';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { StorageModule } from '../storage/storage.module';
import { TenantsModule } from '../tenants/tenants.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asset]),
    StorageModule,
    TenantsModule,
    forwardRef(() => EventsModule),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
