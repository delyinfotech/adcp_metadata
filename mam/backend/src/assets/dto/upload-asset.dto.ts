import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadAssetDto {
  @ApiPropertyOptional({ example: 'Product Launch Video' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Video of our new product launch event' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customMetadata?: string; // Will be JSON parsed
}
