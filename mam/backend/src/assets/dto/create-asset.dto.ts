import { IsString, IsOptional, IsUUID, IsEnum, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssetType } from '../entities/asset.entity';

export class CreateAssetDto {
  @ApiProperty({ example: 'my-video.mp4' })
  @IsString()
  filename: string;

  @ApiPropertyOptional({ example: 'Product Launch Video' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Video of our new product launch event' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: AssetType, example: AssetType.VIDEO })
  @IsEnum(AssetType)
  assetType: AssetType;

  @ApiProperty({ example: 'video/mp4' })
  @IsString()
  mimeType: string;

  @ApiProperty({ example: 104857600 })
  @IsNumber()
  fileSize: number;

  @ApiPropertyOptional({ example: 120 })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 1920 })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiPropertyOptional({ example: 1080 })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  folderId?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  customMetadata?: Record<string, any>;
}
