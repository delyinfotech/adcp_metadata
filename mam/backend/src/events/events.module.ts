import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { EventsService } from './events.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [ConfigModule, HttpModule, forwardRef(() => AssetsModule)],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
