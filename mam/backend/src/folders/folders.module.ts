import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Folder])],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
