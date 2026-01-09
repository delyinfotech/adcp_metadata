import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAssetDto {
  @ApiPropertyOptional({ example: 'Updated Product Launch Video' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description of the product launch' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  customMetadata?: Record<string, any>;
}
