import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: 'Product Videos' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Folder containing all product videos' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  parentFolderId?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  customMetadata?: Record<string, any>;
}
