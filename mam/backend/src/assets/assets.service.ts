import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset, AssetType, AssetStatus } from './entities/asset.entity';
import { StorageService } from '../storage/storage.service';
import { TenantsService } from '../tenants/tenants.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { User } from '../users/entities/user.entity';

export interface AssetListQuery {
  page?: number;
  limit?: number;
  assetType?: AssetType;
  folderId?: string;
  status?: AssetStatus;
  search?: string;
  searchMode?: 'keyword' | 'semantic';
  dateFrom?: string;
  dateTo?: string;
}

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    private storageService: StorageService,
    private tenantsService: TenantsService,
  ) {}

  async create(
    createAssetDto: CreateAssetDto,
    assetKey: string,
    bucket: string,
    user: User,
  ): Promise<Asset> {
    const asset = this.assetRepository.create({
      ...createAssetDto,
      assetKey,
      bucket,
      tenantId: user.tenantId,
      createdById: user.id,
      status: AssetStatus.PROCESSING,
      cdnUrl: this.storageService.getCDNUrl(bucket, assetKey),
    });

    const savedAsset = await this.assetRepository.save(asset);

    // Update tenant storage usage
    await this.tenantsService.updateStorageUsed(user.tenantId, createAssetDto.fileSize);

    this.logger.log(`Asset created: ${savedAsset.id} by user ${user.id}`);

    return savedAsset;
  }

  async findAll(query: AssetListQuery, tenantId: string): Promise<{ data: Asset[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.tenantId = :tenantId', { tenantId })
      .andWhere('asset.deletedAt IS NULL');

    if (query.assetType) {
      queryBuilder.andWhere('asset.assetType = :assetType', { assetType: query.assetType });
    }

    if (query.folderId) {
      queryBuilder.andWhere('asset.folderId = :folderId', { folderId: query.folderId });
    }

    if (query.status) {
      queryBuilder.andWhere('asset.status = :status', { status: query.status });
    }

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      // Use word boundary regex for transcript to avoid substring matches (e.g., "ted" in "wanted")
      // PostgreSQL uses \m and \M for word boundaries (start/end of word)
      const wordBoundaryPattern = `\\m${query.search}\\M`;
      queryBuilder.andWhere(
        `(
          asset.title ILIKE :search
          OR asset.description ILIKE :search
          OR asset.filename ILIKE :search
          OR asset.ai_transcript ~* :wordPattern
          OR array_to_string(asset.ai_tags, ' ') ILIKE :search
          OR asset.ai_features::text ~* :wordPattern
          OR asset.ai_objects::text ILIKE :search
          OR asset.ai_sentiment ILIKE :search
        )`,
        { search: searchTerm, wordPattern: wordBoundaryPattern },
      );
    }

    // Date range filter
    if (query.dateFrom) {
      queryBuilder.andWhere('asset.createdAt >= :dateFrom', { dateFrom: query.dateFrom });
    }
    if (query.dateTo) {
      queryBuilder.andWhere('asset.createdAt <= :dateTo', { dateTo: query.dateTo });
    }

    const [data, total] = await queryBuilder
      .leftJoinAndSelect('asset.folder', 'folder')
      .leftJoinAndSelect('asset.createdBy', 'createdBy')
      .orderBy('asset.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, tenantId: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id, tenantId, deletedAt: null },
      relations: ['folder', 'createdBy', 'updatedBy'],
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto, user: User): Promise<Asset> {
    const asset = await this.findOne(id, user.tenantId);

    // Check if user has permission to update
    if (asset.createdById !== user.id && !this.hasUpdatePermission(user)) {
      throw new ForbiddenException('You do not have permission to update this asset');
    }

    Object.assign(asset, updateAssetDto);
    asset.updatedById = user.id;

    return this.assetRepository.save(asset);
  }

  async updateStatus(id: string, status: AssetStatus, progress?: number): Promise<void> {
    await this.assetRepository.update(id, {
      status,
      ...(progress !== undefined && { processingProgress: progress }),
    });
  }

  async updateAIMetadata(contentId: string, aiMetadata: Partial<Asset>): Promise<void> {
    // Try to find asset by contentId in asset_key (e.g., "asset_1767665592215_l38j12m")
    // The asset_key format is: videos/{tenantId}/{contentId}/{filename}.mp4
    let asset = await this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.assetKey LIKE :contentId', { contentId: `%${contentId}%` })
      .getOne();

    // If not found by contentId, try direct UUID lookup (backwards compatibility)
    if (!asset) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(contentId)) {
        asset = await this.assetRepository.findOne({ where: { id: contentId } });
      }
    }

    if (!asset) {
      this.logger.warn(`Asset not found for contentId: ${contentId}`);
      return;
    }

    await this.assetRepository.update(asset.id, {
      aiTags: aiMetadata.aiTags,
      aiObjects: aiMetadata.aiObjects,
      aiFaces: aiMetadata.aiFaces,
      aiTranscript: aiMetadata.aiTranscript,
      aiSentiment: aiMetadata.aiSentiment,
      aiSafetyScore: aiMetadata.aiSafetyScore,
      aiFeatures: aiMetadata.aiFeatures,
      status: AssetStatus.READY,
      processingProgress: 100,
    });

    this.logger.log(`Asset ${asset.id} AI metadata updated (contentId: ${contentId})`);
  }

  async delete(id: string, user: User): Promise<void> {
    const asset = await this.findOne(id, user.tenantId);

    // Check if user has permission to delete
    if (asset.createdById !== user.id && !this.hasDeletePermission(user)) {
      throw new ForbiddenException('You do not have permission to delete this asset');
    }

    // Soft delete
    asset.deletedAt = new Date();
    await this.assetRepository.save(asset);

    this.logger.log(`Asset ${id} soft deleted by user ${user.id}`);
  }

  async permanentDelete(id: string, user: User): Promise<void> {
    const asset = await this.findOne(id, user.tenantId);

    // Delete from storage
    try {
      await this.storageService.deleteFile(asset.assetKey, asset.bucket);
    } catch (error) {
      this.logger.error(`Failed to delete file from storage: ${error.message}`);
    }

    // Delete from database
    await this.assetRepository.delete(id);

    // Update tenant storage usage
    await this.tenantsService.updateStorageUsed(user.tenantId, -asset.fileSize);

    this.logger.log(`Asset ${id} permanently deleted by user ${user.id}`);
  }

  async getDownloadUrl(id: string, tenantId: string, expiresIn: number = 3600): Promise<string> {
    const asset = await this.findOne(id, tenantId);

    if (asset.status !== AssetStatus.READY) {
      throw new ForbiddenException('Asset is not ready for download');
    }

    return this.storageService.getSignedUrl(asset.assetKey, asset.bucket, { expiresIn });
  }

  async searchByTags(tags: string[], tenantId: string): Promise<Asset[]> {
    return this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.tenantId = :tenantId', { tenantId })
      .andWhere('asset.deletedAt IS NULL')
      .andWhere('asset.aiTags && :tags', { tags })
      .orderBy('asset.createdAt', 'DESC')
      .limit(50)
      .getMany();
  }

  private hasUpdatePermission(user: User): boolean {
    // Check if user has update permission based on role
    const permissions = user.role?.permissions || [];
    return permissions.includes('*') || permissions.includes('asset.update');
  }

  private hasDeletePermission(user: User): boolean {
    // Check if user has delete permission based on role
    const permissions = user.role?.permissions || [];
    return permissions.includes('*') || permissions.includes('asset.delete');
  }

  /**
   * AI-powered search that searches transcript segments, tags, and metadata
   * Returns matched moments with timestamps for video seeking
   */
  async aiSearch(
    query: string,
    tenantId: string,
    options: {
      limit?: number;
      assetType?: AssetType;
      minScore?: number;
    } = {},
  ): Promise<{
    results: Array<{
      asset: Asset;
      score: number;
      matches: Array<{
        type: 'transcript' | 'tag' | 'entity' | 'keyword' | 'title';
        text: string;
        startTime?: number;
        endTime?: number;
        confidence?: number;
      }>;
    }>;
    totalResults: number;
    processingTimeMs: number;
  }> {
    const startTime = Date.now();
    const limit = options.limit || 20;
    const minScore = options.minScore || 0.1;
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    console.log(`[AI Search] Query: "${query}", Words: ${JSON.stringify(queryWords)}, Using whole-word matching v2`);

    // Create word boundary regex for whole word matching
    // Note: Standard \b doesn't treat underscores as word separators, so we normalize text first
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(queryLower)}\\b`, 'i');
    const wordBoundaryRegexes = queryWords.map(w => new RegExp(`\\b${escapeRegex(w)}\\b`, 'i'));

    // Normalize text by replacing underscores with spaces for better word boundary matching
    const normalizeText = (text: string): string => text.replace(/_/g, ' ');

    // Helper function to check if text contains the query as a whole word
    const matchesWholeWord = (text: string): boolean => {
      const normalized = normalizeText(text);
      return wordBoundaryRegex.test(normalized);
    };

    // Helper function to check if text contains any query word as a whole word
    const matchesAnyWord = (text: string): boolean => {
      const normalized = normalizeText(text);
      return wordBoundaryRegexes.some(regex => regex.test(normalized));
    };

    // Get all assets with AI metadata
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.tenantId = :tenantId', { tenantId })
      .andWhere('asset.deletedAt IS NULL')
      .andWhere('asset.status = :status', { status: AssetStatus.READY });

    if (options.assetType) {
      queryBuilder.andWhere('asset.assetType = :assetType', { assetType: options.assetType });
    }

    const assets = await queryBuilder
      .orderBy('asset.createdAt', 'DESC')
      .limit(100) // Get more to filter and rank
      .getMany();

    const scoredResults: Array<{
      asset: Asset;
      score: number;
      matches: Array<{
        type: 'transcript' | 'tag' | 'entity' | 'keyword' | 'title';
        text: string;
        startTime?: number;
        endTime?: number;
        confidence?: number;
      }>;
    }> = [];

    for (const asset of assets) {
      let score = 0;
      const matches: Array<{
        type: 'transcript' | 'tag' | 'entity' | 'keyword' | 'title';
        text: string;
        startTime?: number;
        endTime?: number;
        confidence?: number;
      }> = [];

      const debugAsset = asset.filename?.includes('edward');
      if (debugAsset) console.log(`[AI Debug] Checking asset: ${asset.filename}`);

      // 1. Search in title (highest weight)
      if (asset.title && matchesWholeWord(asset.title)) {
        score += 0.5;
        matches.push({ type: 'title', text: asset.title });
        if (debugAsset) console.log(`[AI Debug] ${asset.filename} matched TITLE: ${asset.title}`);
      }

      // 2. Search in AI tags (exact match for tags)
      if (asset.aiTags && Array.isArray(asset.aiTags)) {
        for (const tag of asset.aiTags) {
          const tagLower = tag.toLowerCase();
          // For tags, match if tag equals query or contains query as whole word
          if (tagLower === queryLower || matchesWholeWord(tag) || queryWords.some(w => tagLower === w)) {
            score += 0.3;
            matches.push({ type: 'tag', text: tag });
            if (debugAsset) console.log(`[AI Debug] ${asset.filename} matched TAG: ${tag}`);
          }
        }
      }

      // 3. Search in transcript segments with timestamps (whole word matching)
      const audioFeatures = (asset.aiFeatures as any)?.audio;
      if (audioFeatures?.segments && Array.isArray(audioFeatures.segments)) {
        for (const segment of audioFeatures.segments) {
          const segmentText = segment.text || '';
          if (matchesWholeWord(segmentText) || matchesAnyWord(segmentText)) {
            score += 0.4;
            matches.push({
              type: 'transcript',
              text: segment.text,
              startTime: segment.start,
              endTime: segment.end,
              confidence: segment.confidence,
            });
            if (debugAsset) console.log(`[AI Debug] ${asset.filename} matched SEGMENT: "${segmentText.substring(0, 50)}..."`);
          }
        }
      }

      // 4. Search in NLP entities (whole word matching)
      const nlpFeatures = (asset.aiFeatures as any)?.nlp;
      if (nlpFeatures?.entities && Array.isArray(nlpFeatures.entities)) {
        for (const entity of nlpFeatures.entities) {
          if (entity.text && matchesWholeWord(entity.text)) {
            score += 0.25;
            matches.push({
              type: 'entity',
              text: `${entity.text} (${entity.type})`,
              confidence: entity.confidence,
            });
            if (debugAsset) console.log(`[AI Debug] ${asset.filename} matched ENTITY: ${entity.text}`);
          }
        }
      }

      // 5. Search in NLP keywords (exact or whole word match)
      if (nlpFeatures?.keywords && Array.isArray(nlpFeatures.keywords)) {
        for (const keyword of nlpFeatures.keywords) {
          const keywordLower = keyword.toLowerCase();
          if (keywordLower === queryLower || matchesWholeWord(keyword) || queryWords.some(w => keywordLower === w)) {
            score += 0.2;
            matches.push({ type: 'keyword', text: keyword });
            if (debugAsset) console.log(`[AI Debug] ${asset.filename} matched KEYWORD: ${keyword}`);
          }
        }
      }

      // 6. Search in NLP topics (whole word match only)
      if (nlpFeatures?.topics && Array.isArray(nlpFeatures.topics)) {
        for (const topic of nlpFeatures.topics) {
          const topicLabelRaw = topic?.label || topic;
          if (!topicLabelRaw || typeof topicLabelRaw !== 'string') continue;
          const topicLabel = topicLabelRaw.toLowerCase();
          if (topicLabel === queryLower || matchesWholeWord(topicLabelRaw) || queryWords.some(w => topicLabel === w)) {
            score += 0.2;
            matches.push({
              type: 'keyword',
              text: `Topic: ${topicLabelRaw}`,
              confidence: topic?.score,
            });
            if (debugAsset) console.log(`[AI Debug] ${asset.filename} matched TOPIC: ${topicLabelRaw}`);
          }
        }
      }

      // 7. Search in vision objects (if available)
      const visionFeatures = (asset.aiFeatures as any)?.vision;
      if (visionFeatures?.uniqueObjects && Array.isArray(visionFeatures.uniqueObjects)) {
        for (const obj of visionFeatures.uniqueObjects) {
          if (!obj || typeof obj !== 'string') continue;
          const objLower = obj.toLowerCase();
          if (objLower === queryLower || matchesWholeWord(obj) || queryWords.some(w => objLower === w)) {
            score += 0.3;
            matches.push({
              type: 'entity',
              text: `Object: ${obj}`,
            });
          }
        }
      }

      // 8. Search in scene descriptions (if available)
      if (visionFeatures?.uniqueScenes && Array.isArray(visionFeatures.uniqueScenes)) {
        for (const scene of visionFeatures.uniqueScenes) {
          if (!scene || typeof scene !== 'string') continue;
          if (matchesWholeWord(scene) || matchesAnyWord(scene)) {
            score += 0.35;
            matches.push({
              type: 'keyword',
              text: `Scene: ${scene}`,
            });
          }
        }
      }

      // 9. Search in detected text from OCR (whole word match)
      if (visionFeatures?.uniqueTexts && Array.isArray(visionFeatures.uniqueTexts)) {
        for (const text of visionFeatures.uniqueTexts) {
          if (!text || typeof text !== 'string') continue;
          const textLower = text.toLowerCase();
          // Use exact match for short OCR text, or whole word match for longer text
          if (textLower === queryLower || matchesWholeWord(text) || queryWords.some(w => textLower === w)) {
            score += 0.4;
            matches.push({
              type: 'entity',
              text: `Text: ${text}`,
            });
          }
        }
      }

      // 10. Search in NLP summary (if available)
      if (nlpFeatures?.summary && matchesWholeWord(nlpFeatures.summary)) {
        score += 0.15;
        const summaryLower = nlpFeatures.summary.toLowerCase();
        const matchIdx = summaryLower.indexOf(queryLower);
        if (matchIdx >= 0) {
          const start = Math.max(0, matchIdx - 30);
          const end = Math.min(nlpFeatures.summary.length, matchIdx + queryLower.length + 30);
          matches.push({
            type: 'keyword',
            text: `Summary: ...${nlpFeatures.summary.substring(start, end)}...`,
          });
        }
      }

      // 10. Fallback: search in full transcript (whole word matching)
      if (matches.length === 0 && asset.aiTranscript) {
        if (matchesWholeWord(asset.aiTranscript)) {
          score += 0.15;
          // Find context around the match
          const matchResult = asset.aiTranscript.match(wordBoundaryRegex);
          if (matchResult && matchResult.index !== undefined) {
            const matchIdx = matchResult.index;
            const start = Math.max(0, matchIdx - 50);
            const end = Math.min(asset.aiTranscript.length, matchIdx + query.length + 50);
            matches.push({
              type: 'transcript',
              text: '...' + asset.aiTranscript.substring(start, end) + '...',
            });
          }
        }
      }

      if (score >= minScore && matches.length > 0) {
        // Normalize score (cap at 1.0)
        const normalizedScore = Math.min(1.0, score);
        scoredResults.push({ asset, score: normalizedScore, matches });
        if (debugAsset) console.log(`[AI Debug] ${asset.filename} ADDED TO RESULTS with score ${normalizedScore}, matches: ${JSON.stringify(matches)}`);
      } else if (debugAsset) {
        console.log(`[AI Debug] ${asset.filename} NOT added: score=${score}, matches=${matches.length}`);
      }
    }

    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);

    // Limit results
    const limitedResults = scoredResults.slice(0, limit);

    return {
      results: limitedResults,
      totalResults: scoredResults.length,
      processingTimeMs: Date.now() - startTime,
    };
  }
}
