import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AssetsService, AssetListQuery } from './assets.service';
import { StorageService } from '../storage/storage.service';
import { EventsService } from '../events/events.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { UploadAssetDto } from './dto/upload-asset.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AssetType, AssetStatus } from './entities/asset.entity';

@ApiTags('Assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly storageService: StorageService,
    private readonly eventsService: EventsService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a new asset file' })
  @ApiResponse({ status: 201, description: 'Asset uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or metadata' })
  async uploadAsset(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 * 1024 }), // 5GB
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadAssetDto: UploadAssetDto,
    @CurrentUser() user: User,
  ) {
    // Determine asset type from mime type
    const assetType = this.getAssetTypeFromMime(file.mimetype);

    // Generate storage key
    const assetId = this.generateAssetId();
    const assetKey = this.storageService.generateAssetKey(
      user.tenantId,
      assetId,
      file.originalname,
      assetType,
    );

    // Upload file to MinIO
    const uploadResult = await this.storageService.uploadFile(
      file.buffer,
      assetKey,
      undefined,
      {
        tenantId: user.tenantId,
        uploadedBy: user.id,
        originalFilename: file.originalname,
      },
      file.mimetype,
    );

    // Create asset record
    const createAssetDto: CreateAssetDto = {
      filename: file.originalname,
      title: uploadAssetDto.title || file.originalname,
      description: uploadAssetDto.description,
      assetType,
      mimeType: file.mimetype,
      fileSize: file.size,
      folderId: uploadAssetDto.folderId,
      customMetadata: uploadAssetDto.customMetadata
        ? JSON.parse(uploadAssetDto.customMetadata)
        : undefined,
    };

    const asset = await this.assetsService.create(
      createAssetDto,
      uploadResult.key,
      uploadResult.bucket,
      user,
    );

    // Publish asset.uploaded event to Kafka for metadata extraction
    await this.eventsService.publishAssetUploaded({
      eventType: 'asset.uploaded',
      assetId: asset.id,
      tenantId: user.tenantId,
      assetType: asset.assetType,
      storageKey: asset.assetKey,
      bucket: asset.bucket,
      mimeType: asset.mimeType,
      metadata: {
        duration: asset.duration,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
      },
    });

    // Publish content.created event for metadata extraction layer
    await this.eventsService.publishContentCreated({
      eventType: 'content.created',
      timestamp: new Date().toISOString(),
      data: {
        id: asset.id,
        contentType: asset.assetType,
        title: asset.title,
        description: asset.description,
        storageUrl: `s3://${asset.bucket}/${asset.assetKey}`,
        tenantId: user.tenantId,
        metadata: {
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
          duration: asset.duration,
          width: asset.width,
          height: asset.height,
        },
      },
    });

    return {
      ...asset,
      uploadUrl: uploadResult.url,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create asset metadata (without file)' })
  @ApiResponse({ status: 201, description: 'Asset metadata created' })
  async create(@Body() createAssetDto: CreateAssetDto, @CurrentUser() user: User) {
    // This endpoint is for creating asset metadata when file is uploaded separately
    const assetKey = `temp/${user.tenantId}/${Date.now()}`;
    return this.assetsService.create(createAssetDto, assetKey, 'content-originals', user);
  }

  @Get()
  @ApiOperation({ summary: 'List and search assets with AI-powered metadata search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'assetType', required: false, enum: AssetType })
  @ApiQuery({ name: 'folderId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AssetStatus })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title, description, filename, AI transcript, tags, and features' })
  @ApiQuery({ name: 'searchMode', required: false, enum: ['keyword', 'semantic'] })
  @ApiQuery({ name: 'dateFrom', required: false, description: 'Filter by date from (ISO 8601)' })
  @ApiQuery({ name: 'dateTo', required: false, description: 'Filter by date to (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'List of assets' })
  async findAll(@Query() query: AssetListQuery, @CurrentUser() user: User) {
    return this.assetsService.findAll(query, user.tenantId);
  }

  @Get('search/tags')
  @ApiOperation({ summary: 'Search assets by AI tags' })
  @ApiQuery({ name: 'tags', required: true, example: 'beach,sunset' })
  @ApiResponse({ status: 200, description: 'Assets matching tags' })
  async searchByTags(@Query('tags') tags: string, @CurrentUser() user: User) {
    const tagArray = tags.split(',').map((t) => t.trim());
    return this.assetsService.searchByTags(tagArray, user.tenantId);
  }

  @Get('ai-search')
  @ApiOperation({
    summary: 'AI-powered search with transcript segments, tags, and entities',
    description: 'Search across transcripts with timestamps, AI tags, NLP entities, and keywords. Returns matched moments with start/end times for video seeking.',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'assetType', required: false, enum: AssetType })
  @ApiQuery({ name: 'minScore', required: false, example: 0.1, description: 'Minimum relevance score (0-1)' })
  @ApiResponse({
    status: 200,
    description: 'AI search results with matched moments and timestamps',
  })
  async aiSearch(
    @Query('q') query: string,
    @Query('limit') limit: string,
    @Query('assetType') assetType: AssetType,
    @Query('minScore') minScore: string,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.aiSearch(query, user.tenantId, {
      limit: limit ? parseInt(limit, 10) : 20,
      assetType,
      minScore: minScore ? parseFloat(minScore) : 0.1,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset found' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.assetsService.findOne(id, user.tenantId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download URL for asset' })
  @ApiQuery({ name: 'expiresIn', required: false, example: 3600 })
  @ApiResponse({ status: 200, description: 'Download URL generated' })
  async getDownloadUrl(
    @Param('id') id: string,
    @Query('expiresIn') expiresIn: number,
    @CurrentUser() user: User,
  ) {
    const url = await this.assetsService.getDownloadUrl(
      id,
      user.tenantId,
      expiresIn ? Number(expiresIn) : 3600,
    );
    return { url, expiresIn: expiresIn || 3600 };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update asset metadata' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto,
    @CurrentUser() user: User,
  ) {
    return this.assetsService.update(id, updateAssetDto, user);
  }

  @Post(':id/extract')
  @ApiOperation({ summary: 'Trigger metadata extraction for asset' })
  @ApiResponse({ status: 202, description: 'Extraction job queued' })
  async triggerExtraction(
    @Param('id') id: string,
    @Body()
    body: {
      services?: string[];
      priority?: 'high' | 'normal' | 'low';
      force?: boolean;
    },
    @CurrentUser() user: User,
  ) {
    const asset = await this.assetsService.findOne(id, user.tenantId);

    return this.eventsService.requestExtraction({
      contentId: asset.id,
      contentType: asset.assetType,
      storageUrl: `s3://${asset.bucket}/${asset.assetKey}`,
      tenantId: user.tenantId,
      title: asset.title,
      description: asset.description,
      services: body?.services,
      priority: body?.priority,
      force: body?.force,
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete asset' })
  @ApiResponse({ status: 204, description: 'Asset deleted' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.assetsService.delete(id, user);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete asset and file' })
  @ApiResponse({ status: 204, description: 'Asset permanently deleted' })
  async permanentDelete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.assetsService.permanentDelete(id, user);
  }

  private getAssetTypeFromMime(mimeType: string): AssetType {
    if (mimeType.startsWith('video/')) return AssetType.VIDEO;
    if (mimeType.startsWith('image/')) return AssetType.IMAGE;
    if (mimeType.startsWith('audio/')) return AssetType.AUDIO;
    return AssetType.DOCUMENT;
  }

  private generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
