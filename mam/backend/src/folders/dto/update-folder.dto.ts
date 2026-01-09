import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiPropertyOptional({ example: 'Updated Product Videos' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  customMetadata?: Record<string, any>;
}
