import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { AssetsService } from '../assets/assets.service';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

export interface AssetUploadedEvent {
  eventType: 'asset.uploaded';
  assetId: string;
  tenantId: string;
  assetType: string;
  storageKey: string;
  bucket?: string;
  mimeType: string;
  metadata: {
    duration?: number;
    width?: number;
    height?: number;
    fileSize?: number;
  };
}

export interface ContentCreatedEvent {
  eventType: 'content.created';
  timestamp: string;
  data: {
    id: string;
    contentType: string;
    title?: string;
    description?: string;
    storageUrl: string;
    thumbnailUrl?: string;
    tenantId: string;
    metadata?: Record<string, any>;
  };
}

export interface MetadataEnrichedEvent {
  eventType: 'metadata.enriched';
  assetId?: string;
  contentId?: string;
  tenantId?: string;
  features?: {
    nlp?: any;
    vision?: any;
    audio?: any;
  };
  data?: {
    assetId?: string;
    contentId: string;
    tenantId?: string;
    features: {
      nlp?: any;
      vision?: any;
      audio?: any;
    };
    jobId?: string;
    completedAt?: string;
    modelVersions?: Record<string, string>;
  };
  extractionTime?: number;
  modelVersions?: Record<string, string>;
}

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsService.name);
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private enabled: boolean;

  private metadataApiUrl: string;

  constructor(
    private configService: ConfigService,
    private assetsService: AssetsService,
    private httpService: HttpService,
  ) {
    this.enabled = this.configService.get<boolean>('kafka.enabled');
    this.metadataApiUrl = this.configService.get<string>('metadataApi.url');

    if (this.enabled) {
      this.kafka = new Kafka({
        brokers: this.configService.get<string[]>('kafka.brokers'),
        clientId: this.configService.get<string>('kafka.clientId'),
      });

      this.producer = this.kafka.producer();
      this.consumer = this.kafka.consumer({
        groupId: this.configService.get<string>('kafka.groupId'),
      });
    }
  }

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.warn('Kafka is disabled. Events will not be published or consumed.');
      return;
    }

    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');

      await this.consumer.connect();
      this.logger.log('Kafka consumer connected');

      // Subscribe to topics
      await this.consumer.subscribe({
        topics: ['metadata.enriched', 'minio.events'],
        fromBeginning: false,
      });

      // Start consuming
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });

      this.logger.log('Kafka event service initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize Kafka: ${error.message}`, error.stack);
    }
  }

  async onModuleDestroy() {
    if (!this.enabled) return;

    try {
      await this.producer.disconnect();
      await this.consumer.disconnect();
      this.logger.log('Kafka connections closed');
    } catch (error) {
      this.logger.error(`Error disconnecting Kafka: ${error.message}`);
    }
  }

  async publishAssetUploaded(event: AssetUploadedEvent): Promise<void> {
    if (!this.enabled) {
      this.logger.debug('Kafka disabled, skipping event publication');
      return;
    }

    try {
      await this.producer.send({
        topic: 'asset.uploaded',
        messages: [
          {
            key: event.assetId,
            value: JSON.stringify(event),
            headers: {
              eventType: 'asset.uploaded',
              tenantId: event.tenantId,
            },
          },
        ],
      });

      this.logger.log(`Published asset.uploaded event for asset ${event.assetId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish asset.uploaded event: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishContentCreated(event: ContentCreatedEvent): Promise<void> {
    if (!this.enabled) {
      await this.triggerMetadataExtraction(event);
      return;
    }

    try {
      await this.producer.send({
        topic: 'content.created',
        messages: [
          {
            key: event.data.id,
            value: JSON.stringify(event),
            headers: {
              eventType: 'content.created',
              tenantId: event.data.tenantId,
            },
          },
        ],
      });

      this.logger.log(`Published content.created event for asset ${event.data.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish content.created event: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, message } = payload;

    try {
      const value = message.value?.toString();
      if (!value) return;

      const event = JSON.parse(value);

      switch (topic) {
        case 'metadata.enriched':
          await this.handleMetadataEnriched(event);
          break;
        case 'minio.events':
          await this.handleMinIOEvent(event);
          break;
        default:
          this.logger.debug(`Received message from unknown topic: ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Error handling message from ${topic}: ${error.message}`, error.stack);
    }
  }

  private async handleMetadataEnriched(event: MetadataEnrichedEvent): Promise<void> {
    const normalized = this.normalizeMetadataEvent(event);
    if (!normalized.assetId) {
      this.logger.warn('metadata.enriched event missing assetId/contentId');
      return;
    }

    this.logger.log(`Received metadata.enriched event for asset ${normalized.assetId}`);

    try {
      const { assetId, features: rawFeatures } = normalized;
      const nlp = this.unwrapFeatures(rawFeatures?.nlp);
      const vision = this.unwrapFeatures(rawFeatures?.vision);
      const audio = this.unwrapFeatures(rawFeatures?.audio);

      // Extract tags from features
      const aiTags = this.extractTags({ nlp, vision, audio });

      // Update asset with AI metadata
      await this.assetsService.updateAIMetadata(assetId, {
        aiTags,
        aiObjects: vision?.objects || null,
        aiFaces: vision?.faces || null,
        aiTranscript: this.extractTranscript(audio),
        aiSentiment: this.extractSentiment(nlp),
        aiSafetyScore: this.extractSafetyScore(vision),
        aiFeatures: rawFeatures,
      });

      this.logger.log(`Asset ${assetId} metadata updated from extraction`);
    } catch (error) {
      this.logger.error(
        `Failed to process metadata.enriched event: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleMinIOEvent(event: any): Promise<void> {
    this.logger.debug(`Received MinIO event: ${event.EventName}`);

    // MinIO events can be used for additional processing if needed
    // For now, we primarily rely on the asset.uploaded event
  }

  private normalizeMetadataEvent(event: MetadataEnrichedEvent): {
    assetId?: string;
    features: any;
  } {
    const features = event.features || event.data?.features || {};
    const assetId =
      event.assetId ||
      event.contentId ||
      event.data?.contentId ||
      event.data?.assetId;

    return {
      assetId,
      features,
    };
  }

  private unwrapFeatures(features: any): any {
    if (!features) return null;
    return features.features ? features.features : features;
  }

  private extractTranscript(audio: any): string | null {
    if (!audio) return null;
    if (typeof audio.transcript === 'string') {
      return audio.transcript;
    }
    if (Array.isArray(audio.segments)) {
      return audio.segments.map((segment: any) => segment.text).join(' ');
    }
    if (audio.transcript?.text) {
      return audio.transcript.text;
    }
    return null;
  }

  private extractSentiment(nlp: any): string | null {
    if (!nlp) return null;
    if (typeof nlp.sentiment === 'string') return nlp.sentiment;
    if (nlp.sentiment?.overall) return nlp.sentiment.overall;
    return null;
  }

  private extractSafetyScore(vision: any): number | null {
    if (!vision) return null;
    const labels = vision.safety_labels || vision.safetyLabels;
    if (!labels) return null;
    if (typeof labels.safe === 'number') return labels.safe;

    const risks = ['violence', 'explicit', 'adult', 'racy']
      .map((key) => (typeof labels[key] === 'number' ? labels[key] : 0));
    const maxRisk = Math.max(...risks, 0);
    return Math.max(0, 1 - maxRisk);
  }

  private extractTags(features: { nlp?: any; vision?: any; audio?: any }): string[] {
    const tags = new Set<string>();

    // From NLP
    if (features.nlp?.entities) {
      features.nlp.entities.forEach((entity: any) => {
        const value =
          typeof entity === 'string'
            ? entity
            : entity.text || entity.label || entity.name;
        if (value) tags.add(value.toLowerCase());
      });
    }
    if (features.nlp?.topics) {
      features.nlp.topics.forEach((topic: any) => {
        const value = typeof topic === 'string' ? topic : topic.label;
        if (value) tags.add(value.toLowerCase());
      });
    }
    if (features.nlp?.keywords) {
      features.nlp.keywords.forEach((keyword: string) => tags.add(keyword.toLowerCase()));
    }

    // From Vision
    if (features.vision?.objects) {
      if (Array.isArray(features.vision.objects)) {
        features.vision.objects.forEach((obj: any) => {
          const value = obj.label || obj.name || obj;
          if (value) tags.add(String(value).toLowerCase());
        });
      } else {
        Object.values(features.vision.objects).forEach((obj: any) => {
          const value = obj.label || obj.name;
          if (value) tags.add(String(value).toLowerCase());
        });
        Object.keys(features.vision.objects).forEach((key) =>
          tags.add(key.toLowerCase()),
        );
      }
    }
    if (features.vision?.scenes) {
      features.vision.scenes.forEach((scene: any) => {
        const value = scene.label || scene.description;
        if (value) tags.add(String(value).toLowerCase());
      });
    }

    // From Audio
    if (features.audio?.music_genres) {
      features.audio.music_genres.forEach((genre: string) => tags.add(genre.toLowerCase()));
    }
    if (features.audio?.sound_types) {
      features.audio.sound_types.forEach((sound: string) => tags.add(sound.toLowerCase()));
    }
    if (features.audio?.profanity_words) {
      features.audio.profanity_words.forEach((word: string) => tags.add(word.toLowerCase()));
    }

    return Array.from(tags);
  }

  private async triggerMetadataExtraction(event: ContentCreatedEvent): Promise<void> {
    if (!this.metadataApiUrl) {
      this.logger.warn('Metadata API URL not configured; skipping extraction trigger');
      return;
    }

    const url = `${this.metadataApiUrl}/api/v1/metadata/content/${event.data.id}/extract`;
    const payload = {
      contentId: event.data.id,
      contentType: event.data.contentType,
      storageUrl: event.data.storageUrl,
      tenantId: event.data.tenantId,
      title: event.data.title,
      description: event.data.description,
      thumbnailUrl: event.data.thumbnailUrl,
      metadata: event.data.metadata,
    };

    try {
      await firstValueFrom(this.httpService.post(url, payload));
      this.logger.log(`Triggered extraction via REST for asset ${event.data.id}`);
    } catch (error) {
      const message = error?.response?.data || error.message;
      this.logger.error(`REST extraction trigger failed: ${message}`);
    }
  }

  async requestExtraction(params: {
    contentId: string;
    contentType: string;
    storageUrl: string;
    tenantId: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    priority?: string;
    services?: string[];
    force?: boolean;
  }): Promise<any> {
    if (!this.metadataApiUrl) {
      throw new Error('Metadata API URL not configured');
    }

    const url = `${this.metadataApiUrl}/api/v1/metadata/content/${params.contentId}/extract`;
    const payload = {
      contentId: params.contentId,
      contentType: params.contentType,
      storageUrl: params.storageUrl,
      tenantId: params.tenantId,
      title: params.title,
      description: params.description,
      thumbnailUrl: params.thumbnailUrl,
      priority: params.priority,
      services: params.services,
      force: params.force,
    };

    const response: AxiosResponse = await firstValueFrom(this.httpService.post(url, payload));
    return response.data;
  }
}
