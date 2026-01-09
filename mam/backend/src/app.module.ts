import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { AssetsModule } from './assets/assets.module';
import { FoldersModule } from './folders/folders.module';
import { StorageModule } from './storage/storage.module';
import { EventsModule } from './events/events.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        autoLoadEntities: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl')
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),

    // Database seeding
    DatabaseModule,

    // Health checks
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    AssetsModule,
    FoldersModule,
    StorageModule,
    EventsModule,
  ],
})
export class AppModule {}
