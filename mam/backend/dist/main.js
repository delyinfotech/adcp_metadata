/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.module.ts":
/*!***************************!*\
  !*** ./src/app.module.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const configuration_1 = __webpack_require__(/*! ./config/configuration */ "./src/config/configuration.ts");
const auth_module_1 = __webpack_require__(/*! ./auth/auth.module */ "./src/auth/auth.module.ts");
const users_module_1 = __webpack_require__(/*! ./users/users.module */ "./src/users/users.module.ts");
const tenants_module_1 = __webpack_require__(/*! ./tenants/tenants.module */ "./src/tenants/tenants.module.ts");
const assets_module_1 = __webpack_require__(/*! ./assets/assets.module */ "./src/assets/assets.module.ts");
const folders_module_1 = __webpack_require__(/*! ./folders/folders.module */ "./src/folders/folders.module.ts");
const storage_module_1 = __webpack_require__(/*! ./storage/storage.module */ "./src/storage/storage.module.ts");
const events_module_1 = __webpack_require__(/*! ./events/events.module */ "./src/events/events.module.ts");
const database_module_1 = __webpack_require__(/*! ./database/database.module */ "./src/database/database.module.ts");
const health_module_1 = __webpack_require__(/*! ./health/health.module */ "./src/health/health.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.database'),
                    autoLoadEntities: true,
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('database.synchronize'),
                    logging: configService.get('database.logging'),
                    ssl: configService.get('database.ssl')
                        ? { rejectUnauthorized: false }
                        : false,
                }),
                inject: [config_1.ConfigService],
            }),
            database_module_1.DatabaseModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tenants_module_1.TenantsModule,
            assets_module_1.AssetsModule,
            folders_module_1.FoldersModule,
            storage_module_1.StorageModule,
            events_module_1.EventsModule,
        ],
    })
], AppModule);


/***/ }),

/***/ "./src/assets/assets.controller.ts":
/*!*****************************************!*\
  !*** ./src/assets/assets.controller.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssetsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const assets_service_1 = __webpack_require__(/*! ./assets.service */ "./src/assets/assets.service.ts");
const storage_service_1 = __webpack_require__(/*! ../storage/storage.service */ "./src/storage/storage.service.ts");
const events_service_1 = __webpack_require__(/*! ../events/events.service */ "./src/events/events.service.ts");
const create_asset_dto_1 = __webpack_require__(/*! ./dto/create-asset.dto */ "./src/assets/dto/create-asset.dto.ts");
const update_asset_dto_1 = __webpack_require__(/*! ./dto/update-asset.dto */ "./src/assets/dto/update-asset.dto.ts");
const upload_asset_dto_1 = __webpack_require__(/*! ./dto/upload-asset.dto */ "./src/assets/dto/upload-asset.dto.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const user_entity_1 = __webpack_require__(/*! ../users/entities/user.entity */ "./src/users/entities/user.entity.ts");
const asset_entity_1 = __webpack_require__(/*! ./entities/asset.entity */ "./src/assets/entities/asset.entity.ts");
let AssetsController = class AssetsController {
    constructor(assetsService, storageService, eventsService) {
        this.assetsService = assetsService;
        this.storageService = storageService;
        this.eventsService = eventsService;
    }
    async uploadAsset(file, uploadAssetDto, user) {
        const assetType = this.getAssetTypeFromMime(file.mimetype);
        const assetId = this.generateAssetId();
        const assetKey = this.storageService.generateAssetKey(user.tenantId, assetId, file.originalname, assetType);
        const uploadResult = await this.storageService.uploadFile(file.buffer, assetKey, undefined, {
            tenantId: user.tenantId,
            uploadedBy: user.id,
            originalFilename: file.originalname,
        }, file.mimetype);
        const createAssetDto = {
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
        const asset = await this.assetsService.create(createAssetDto, uploadResult.key, uploadResult.bucket, user);
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
    async create(createAssetDto, user) {
        const assetKey = `temp/${user.tenantId}/${Date.now()}`;
        return this.assetsService.create(createAssetDto, assetKey, 'content-originals', user);
    }
    async findAll(query, user) {
        return this.assetsService.findAll(query, user.tenantId);
    }
    async searchByTags(tags, user) {
        const tagArray = tags.split(',').map((t) => t.trim());
        return this.assetsService.searchByTags(tagArray, user.tenantId);
    }
    async aiSearch(query, limit, assetType, minScore, user) {
        return this.assetsService.aiSearch(query, user.tenantId, {
            limit: limit ? parseInt(limit, 10) : 20,
            assetType,
            minScore: minScore ? parseFloat(minScore) : 0.1,
        });
    }
    async findOne(id, user) {
        return this.assetsService.findOne(id, user.tenantId);
    }
    async getDownloadUrl(id, expiresIn, user) {
        const url = await this.assetsService.getDownloadUrl(id, user.tenantId, expiresIn ? Number(expiresIn) : 3600);
        return { url, expiresIn: expiresIn || 3600 };
    }
    async update(id, updateAssetDto, user) {
        return this.assetsService.update(id, updateAssetDto, user);
    }
    async triggerExtraction(id, body, user) {
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
    async delete(id, user) {
        await this.assetsService.delete(id, user);
    }
    async permanentDelete(id, user) {
        await this.assetsService.permanentDelete(id, user);
    }
    getAssetTypeFromMime(mimeType) {
        if (mimeType.startsWith('video/'))
            return asset_entity_1.AssetType.VIDEO;
        if (mimeType.startsWith('image/'))
            return asset_entity_1.AssetType.IMAGE;
        if (mimeType.startsWith('audio/'))
            return asset_entity_1.AssetType.AUDIO;
        return asset_entity_1.AssetType.DOCUMENT;
    }
    generateAssetId() {
        return `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
};
exports.AssetsController = AssetsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a new asset file' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file or metadata' }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 * 1024 }),
        ],
    }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof Express !== "undefined" && (_d = Express.Multer) !== void 0 && _d.File) === "function" ? _e : Object, typeof (_f = typeof upload_asset_dto_1.UploadAssetDto !== "undefined" && upload_asset_dto_1.UploadAssetDto) === "function" ? _f : Object, typeof (_g = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _g : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "uploadAsset", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create asset metadata (without file)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Asset metadata created' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof create_asset_dto_1.CreateAssetDto !== "undefined" && create_asset_dto_1.CreateAssetDto) === "function" ? _h : Object, typeof (_j = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List and search assets with AI-powered metadata search' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'assetType', required: false, enum: asset_entity_1.AssetType }),
    (0, swagger_1.ApiQuery)({ name: 'folderId', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: asset_entity_1.AssetStatus }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Search in title, description, filename, AI transcript, tags, and features' }),
    (0, swagger_1.ApiQuery)({ name: 'searchMode', required: false, enum: ['keyword', 'semantic'] }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', required: false, description: 'Filter by date from (ISO 8601)' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', required: false, description: 'Filter by date to (ISO 8601)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of assets' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof assets_service_1.AssetListQuery !== "undefined" && assets_service_1.AssetListQuery) === "function" ? _k : Object, typeof (_l = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _l : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Search assets by AI tags' }),
    (0, swagger_1.ApiQuery)({ name: 'tags', required: true, example: 'beach,sunset' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Assets matching tags' }),
    __param(0, (0, common_1.Query)('tags')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_m = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _m : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "searchByTags", null);
__decorate([
    (0, common_1.Get)('ai-search'),
    (0, swagger_1.ApiOperation)({
        summary: 'AI-powered search with transcript segments, tags, and entities',
        description: 'Search across transcripts with timestamps, AI tags, NLP entities, and keywords. Returns matched moments with start/end times for video seeking.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, description: 'Search query' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, example: 20 }),
    (0, swagger_1.ApiQuery)({ name: 'assetType', required: false, enum: asset_entity_1.AssetType }),
    (0, swagger_1.ApiQuery)({ name: 'minScore', required: false, example: 0.1, description: 'Minimum relevance score (0-1)' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'AI search results with matched moments and timestamps',
    }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('assetType')),
    __param(3, (0, common_1.Query)('minScore')),
    __param(4, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_o = typeof asset_entity_1.AssetType !== "undefined" && asset_entity_1.AssetType) === "function" ? _o : Object, String, typeof (_p = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _p : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "aiSearch", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get asset by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_q = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _q : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Get download URL for asset' }),
    (0, swagger_1.ApiQuery)({ name: 'expiresIn', required: false, example: 3600 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Download URL generated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('expiresIn')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, typeof (_r = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _r : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getDownloadUrl", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update asset metadata' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Asset updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_s = typeof update_asset_dto_1.UpdateAssetDto !== "undefined" && update_asset_dto_1.UpdateAssetDto) === "function" ? _s : Object, typeof (_t = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _t : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/extract'),
    (0, swagger_1.ApiOperation)({ summary: 'Trigger metadata extraction for asset' }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Extraction job queued' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, typeof (_u = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _u : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "triggerExtraction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete asset' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Asset deleted' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Asset not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_v = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _v : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "delete", null);
__decorate([
    (0, common_1.Delete)(':id/permanent'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Permanently delete asset and file' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Asset permanently deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_w = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _w : Object]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "permanentDelete", null);
exports.AssetsController = AssetsController = __decorate([
    (0, swagger_1.ApiTags)('Assets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('assets'),
    __metadata("design:paramtypes", [typeof (_a = typeof assets_service_1.AssetsService !== "undefined" && assets_service_1.AssetsService) === "function" ? _a : Object, typeof (_b = typeof storage_service_1.StorageService !== "undefined" && storage_service_1.StorageService) === "function" ? _b : Object, typeof (_c = typeof events_service_1.EventsService !== "undefined" && events_service_1.EventsService) === "function" ? _c : Object])
], AssetsController);


/***/ }),

/***/ "./src/assets/assets.module.ts":
/*!*************************************!*\
  !*** ./src/assets/assets.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssetsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const asset_entity_1 = __webpack_require__(/*! ./entities/asset.entity */ "./src/assets/entities/asset.entity.ts");
const assets_service_1 = __webpack_require__(/*! ./assets.service */ "./src/assets/assets.service.ts");
const assets_controller_1 = __webpack_require__(/*! ./assets.controller */ "./src/assets/assets.controller.ts");
const storage_module_1 = __webpack_require__(/*! ../storage/storage.module */ "./src/storage/storage.module.ts");
const tenants_module_1 = __webpack_require__(/*! ../tenants/tenants.module */ "./src/tenants/tenants.module.ts");
const events_module_1 = __webpack_require__(/*! ../events/events.module */ "./src/events/events.module.ts");
let AssetsModule = class AssetsModule {
};
exports.AssetsModule = AssetsModule;
exports.AssetsModule = AssetsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([asset_entity_1.Asset]),
            storage_module_1.StorageModule,
            tenants_module_1.TenantsModule,
            (0, common_1.forwardRef)(() => events_module_1.EventsModule),
        ],
        controllers: [assets_controller_1.AssetsController],
        providers: [assets_service_1.AssetsService],
        exports: [assets_service_1.AssetsService],
    })
], AssetsModule);


/***/ }),

/***/ "./src/assets/assets.service.ts":
/*!**************************************!*\
  !*** ./src/assets/assets.service.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AssetsService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AssetsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const asset_entity_1 = __webpack_require__(/*! ./entities/asset.entity */ "./src/assets/entities/asset.entity.ts");
const storage_service_1 = __webpack_require__(/*! ../storage/storage.service */ "./src/storage/storage.service.ts");
const tenants_service_1 = __webpack_require__(/*! ../tenants/tenants.service */ "./src/tenants/tenants.service.ts");
let AssetsService = AssetsService_1 = class AssetsService {
    constructor(assetRepository, storageService, tenantsService) {
        this.assetRepository = assetRepository;
        this.storageService = storageService;
        this.tenantsService = tenantsService;
        this.logger = new common_1.Logger(AssetsService_1.name);
    }
    async create(createAssetDto, assetKey, bucket, user) {
        const asset = this.assetRepository.create({
            ...createAssetDto,
            assetKey,
            bucket,
            tenantId: user.tenantId,
            createdById: user.id,
            status: asset_entity_1.AssetStatus.PROCESSING,
            cdnUrl: this.storageService.getCDNUrl(bucket, assetKey),
        });
        const savedAsset = await this.assetRepository.save(asset);
        await this.tenantsService.updateStorageUsed(user.tenantId, createAssetDto.fileSize);
        this.logger.log(`Asset created: ${savedAsset.id} by user ${user.id}`);
        return savedAsset;
    }
    async findAll(query, tenantId) {
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
            const wordBoundaryPattern = `\\m${query.search}\\M`;
            queryBuilder.andWhere(`(
          asset.title ILIKE :search
          OR asset.description ILIKE :search
          OR asset.filename ILIKE :search
          OR asset.ai_transcript ~* :wordPattern
          OR array_to_string(asset.ai_tags, ' ') ILIKE :search
          OR asset.ai_features::text ~* :wordPattern
          OR asset.ai_objects::text ILIKE :search
          OR asset.ai_sentiment ILIKE :search
        )`, { search: searchTerm, wordPattern: wordBoundaryPattern });
        }
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
    async findOne(id, tenantId) {
        const asset = await this.assetRepository.findOne({
            where: { id, tenantId, deletedAt: null },
            relations: ['folder', 'createdBy', 'updatedBy'],
        });
        if (!asset) {
            throw new common_1.NotFoundException(`Asset with ID ${id} not found`);
        }
        return asset;
    }
    async update(id, updateAssetDto, user) {
        const asset = await this.findOne(id, user.tenantId);
        if (asset.createdById !== user.id && !this.hasUpdatePermission(user)) {
            throw new common_1.ForbiddenException('You do not have permission to update this asset');
        }
        Object.assign(asset, updateAssetDto);
        asset.updatedById = user.id;
        return this.assetRepository.save(asset);
    }
    async updateStatus(id, status, progress) {
        await this.assetRepository.update(id, {
            status,
            ...(progress !== undefined && { processingProgress: progress }),
        });
    }
    async updateAIMetadata(contentId, aiMetadata) {
        let asset = await this.assetRepository
            .createQueryBuilder('asset')
            .where('asset.assetKey LIKE :contentId', { contentId: `%${contentId}%` })
            .getOne();
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
            status: asset_entity_1.AssetStatus.READY,
            processingProgress: 100,
        });
        this.logger.log(`Asset ${asset.id} AI metadata updated (contentId: ${contentId})`);
    }
    async delete(id, user) {
        const asset = await this.findOne(id, user.tenantId);
        if (asset.createdById !== user.id && !this.hasDeletePermission(user)) {
            throw new common_1.ForbiddenException('You do not have permission to delete this asset');
        }
        asset.deletedAt = new Date();
        await this.assetRepository.save(asset);
        this.logger.log(`Asset ${id} soft deleted by user ${user.id}`);
    }
    async permanentDelete(id, user) {
        const asset = await this.findOne(id, user.tenantId);
        try {
            await this.storageService.deleteFile(asset.assetKey, asset.bucket);
        }
        catch (error) {
            this.logger.error(`Failed to delete file from storage: ${error.message}`);
        }
        await this.assetRepository.delete(id);
        await this.tenantsService.updateStorageUsed(user.tenantId, -asset.fileSize);
        this.logger.log(`Asset ${id} permanently deleted by user ${user.id}`);
    }
    async getDownloadUrl(id, tenantId, expiresIn = 3600) {
        const asset = await this.findOne(id, tenantId);
        if (asset.status !== asset_entity_1.AssetStatus.READY) {
            throw new common_1.ForbiddenException('Asset is not ready for download');
        }
        return this.storageService.getSignedUrl(asset.assetKey, asset.bucket, { expiresIn });
    }
    async searchByTags(tags, tenantId) {
        return this.assetRepository
            .createQueryBuilder('asset')
            .where('asset.tenantId = :tenantId', { tenantId })
            .andWhere('asset.deletedAt IS NULL')
            .andWhere('asset.aiTags && :tags', { tags })
            .orderBy('asset.createdAt', 'DESC')
            .limit(50)
            .getMany();
    }
    hasUpdatePermission(user) {
        const permissions = user.role?.permissions || [];
        return permissions.includes('*') || permissions.includes('asset.update');
    }
    hasDeletePermission(user) {
        const permissions = user.role?.permissions || [];
        return permissions.includes('*') || permissions.includes('asset.delete');
    }
    async aiSearch(query, tenantId, options = {}) {
        const startTime = Date.now();
        const limit = options.limit || 20;
        const minScore = options.minScore || 0.1;
        const queryLower = query.toLowerCase().trim();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
        console.log(`[AI Search] Query: "${query}", Words: ${JSON.stringify(queryWords)}, Using whole-word matching v2`);
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundaryRegex = new RegExp(`\\b${escapeRegex(queryLower)}\\b`, 'i');
        const wordBoundaryRegexes = queryWords.map(w => new RegExp(`\\b${escapeRegex(w)}\\b`, 'i'));
        const normalizeText = (text) => text.replace(/_/g, ' ');
        const matchesWholeWord = (text) => {
            const normalized = normalizeText(text);
            return wordBoundaryRegex.test(normalized);
        };
        const matchesAnyWord = (text) => {
            const normalized = normalizeText(text);
            return wordBoundaryRegexes.some(regex => regex.test(normalized));
        };
        const queryBuilder = this.assetRepository
            .createQueryBuilder('asset')
            .where('asset.tenantId = :tenantId', { tenantId })
            .andWhere('asset.deletedAt IS NULL')
            .andWhere('asset.status = :status', { status: asset_entity_1.AssetStatus.READY });
        if (options.assetType) {
            queryBuilder.andWhere('asset.assetType = :assetType', { assetType: options.assetType });
        }
        const assets = await queryBuilder
            .orderBy('asset.createdAt', 'DESC')
            .limit(100)
            .getMany();
        const scoredResults = [];
        for (const asset of assets) {
            let score = 0;
            const matches = [];
            const debugAsset = asset.filename?.includes('edward');
            if (debugAsset)
                console.log(`[AI Debug] Checking asset: ${asset.filename}`);
            if (asset.title && matchesWholeWord(asset.title)) {
                score += 0.5;
                matches.push({ type: 'title', text: asset.title });
                if (debugAsset)
                    console.log(`[AI Debug] ${asset.filename} matched TITLE: ${asset.title}`);
            }
            if (asset.aiTags && Array.isArray(asset.aiTags)) {
                for (const tag of asset.aiTags) {
                    const tagLower = tag.toLowerCase();
                    if (tagLower === queryLower || matchesWholeWord(tag) || queryWords.some(w => tagLower === w)) {
                        score += 0.3;
                        matches.push({ type: 'tag', text: tag });
                        if (debugAsset)
                            console.log(`[AI Debug] ${asset.filename} matched TAG: ${tag}`);
                    }
                }
            }
            const audioFeatures = asset.aiFeatures?.audio;
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
                        if (debugAsset)
                            console.log(`[AI Debug] ${asset.filename} matched SEGMENT: "${segmentText.substring(0, 50)}..."`);
                    }
                }
            }
            const nlpFeatures = asset.aiFeatures?.nlp;
            if (nlpFeatures?.entities && Array.isArray(nlpFeatures.entities)) {
                for (const entity of nlpFeatures.entities) {
                    if (entity.text && matchesWholeWord(entity.text)) {
                        score += 0.25;
                        matches.push({
                            type: 'entity',
                            text: `${entity.text} (${entity.type})`,
                            confidence: entity.confidence,
                        });
                        if (debugAsset)
                            console.log(`[AI Debug] ${asset.filename} matched ENTITY: ${entity.text}`);
                    }
                }
            }
            if (nlpFeatures?.keywords && Array.isArray(nlpFeatures.keywords)) {
                for (const keyword of nlpFeatures.keywords) {
                    const keywordLower = keyword.toLowerCase();
                    if (keywordLower === queryLower || matchesWholeWord(keyword) || queryWords.some(w => keywordLower === w)) {
                        score += 0.2;
                        matches.push({ type: 'keyword', text: keyword });
                        if (debugAsset)
                            console.log(`[AI Debug] ${asset.filename} matched KEYWORD: ${keyword}`);
                    }
                }
            }
            if (nlpFeatures?.topics && Array.isArray(nlpFeatures.topics)) {
                for (const topic of nlpFeatures.topics) {
                    const topicLabelRaw = topic?.label || topic;
                    if (!topicLabelRaw || typeof topicLabelRaw !== 'string')
                        continue;
                    const topicLabel = topicLabelRaw.toLowerCase();
                    if (topicLabel === queryLower || matchesWholeWord(topicLabelRaw) || queryWords.some(w => topicLabel === w)) {
                        score += 0.2;
                        matches.push({
                            type: 'keyword',
                            text: `Topic: ${topicLabelRaw}`,
                            confidence: topic?.score,
                        });
                        if (debugAsset)
                            console.log(`[AI Debug] ${asset.filename} matched TOPIC: ${topicLabelRaw}`);
                    }
                }
            }
            const visionFeatures = asset.aiFeatures?.vision;
            if (visionFeatures?.uniqueObjects && Array.isArray(visionFeatures.uniqueObjects)) {
                for (const obj of visionFeatures.uniqueObjects) {
                    if (!obj || typeof obj !== 'string')
                        continue;
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
            if (visionFeatures?.uniqueScenes && Array.isArray(visionFeatures.uniqueScenes)) {
                for (const scene of visionFeatures.uniqueScenes) {
                    if (!scene || typeof scene !== 'string')
                        continue;
                    if (matchesWholeWord(scene) || matchesAnyWord(scene)) {
                        score += 0.35;
                        matches.push({
                            type: 'keyword',
                            text: `Scene: ${scene}`,
                        });
                    }
                }
            }
            if (visionFeatures?.uniqueTexts && Array.isArray(visionFeatures.uniqueTexts)) {
                for (const text of visionFeatures.uniqueTexts) {
                    if (!text || typeof text !== 'string')
                        continue;
                    const textLower = text.toLowerCase();
                    if (textLower === queryLower || matchesWholeWord(text) || queryWords.some(w => textLower === w)) {
                        score += 0.4;
                        matches.push({
                            type: 'entity',
                            text: `Text: ${text}`,
                        });
                    }
                }
            }
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
            if (matches.length === 0 && asset.aiTranscript) {
                if (matchesWholeWord(asset.aiTranscript)) {
                    score += 0.15;
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
                const normalizedScore = Math.min(1.0, score);
                scoredResults.push({ asset, score: normalizedScore, matches });
                if (debugAsset)
                    console.log(`[AI Debug] ${asset.filename} ADDED TO RESULTS with score ${normalizedScore}, matches: ${JSON.stringify(matches)}`);
            }
            else if (debugAsset) {
                console.log(`[AI Debug] ${asset.filename} NOT added: score=${score}, matches=${matches.length}`);
            }
        }
        scoredResults.sort((a, b) => b.score - a.score);
        const limitedResults = scoredResults.slice(0, limit);
        return {
            results: limitedResults,
            totalResults: scoredResults.length,
            processingTimeMs: Date.now() - startTime,
        };
    }
};
exports.AssetsService = AssetsService;
exports.AssetsService = AssetsService = AssetsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(asset_entity_1.Asset)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof storage_service_1.StorageService !== "undefined" && storage_service_1.StorageService) === "function" ? _b : Object, typeof (_c = typeof tenants_service_1.TenantsService !== "undefined" && tenants_service_1.TenantsService) === "function" ? _c : Object])
], AssetsService);


/***/ }),

/***/ "./src/assets/dto/create-asset.dto.ts":
/*!********************************************!*\
  !*** ./src/assets/dto/create-asset.dto.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateAssetDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const asset_entity_1 = __webpack_require__(/*! ../entities/asset.entity */ "./src/assets/entities/asset.entity.ts");
class CreateAssetDto {
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'my-video.mp4' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Product Launch Video' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Video of our new product launch event' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: asset_entity_1.AssetType, example: asset_entity_1.AssetType.VIDEO }),
    (0, class_validator_1.IsEnum)(asset_entity_1.AssetType),
    __metadata("design:type", typeof (_a = typeof asset_entity_1.AssetType !== "undefined" && asset_entity_1.AssetType) === "function" ? _a : Object)
], CreateAssetDto.prototype, "assetType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'video/mp4' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 104857600 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "fileSize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 120 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1920 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "width", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1080 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAssetDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "folderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], CreateAssetDto.prototype, "customMetadata", void 0);


/***/ }),

/***/ "./src/assets/dto/update-asset.dto.ts":
/*!********************************************!*\
  !*** ./src/assets/dto/update-asset.dto.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateAssetDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class UpdateAssetDto {
}
exports.UpdateAssetDto = UpdateAssetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated Product Launch Video' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description of the product launch' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "folderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], UpdateAssetDto.prototype, "customMetadata", void 0);


/***/ }),

/***/ "./src/assets/dto/upload-asset.dto.ts":
/*!********************************************!*\
  !*** ./src/assets/dto/upload-asset.dto.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UploadAssetDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class UploadAssetDto {
}
exports.UploadAssetDto = UploadAssetDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Product Launch Video' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadAssetDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Video of our new product launch event' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadAssetDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadAssetDto.prototype, "folderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UploadAssetDto.prototype, "customMetadata", void 0);


/***/ }),

/***/ "./src/assets/entities/asset.entity.ts":
/*!*********************************************!*\
  !*** ./src/assets/entities/asset.entity.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Asset = exports.AssetStatus = exports.AssetType = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ../../users/entities/user.entity */ "./src/users/entities/user.entity.ts");
const tenant_entity_1 = __webpack_require__(/*! ../../tenants/entities/tenant.entity */ "./src/tenants/entities/tenant.entity.ts");
const folder_entity_1 = __webpack_require__(/*! ../../folders/entities/folder.entity */ "./src/folders/entities/folder.entity.ts");
var AssetType;
(function (AssetType) {
    AssetType["VIDEO"] = "video";
    AssetType["IMAGE"] = "image";
    AssetType["AUDIO"] = "audio";
    AssetType["DOCUMENT"] = "document";
})(AssetType || (exports.AssetType = AssetType = {}));
var AssetStatus;
(function (AssetStatus) {
    AssetStatus["PROCESSING"] = "processing";
    AssetStatus["READY"] = "ready";
    AssetStatus["FAILED"] = "failed";
    AssetStatus["ARCHIVED"] = "archived";
})(AssetStatus || (exports.AssetStatus = AssetStatus = {}));
let Asset = class Asset {
};
exports.Asset = Asset;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Asset.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, unique: true, name: 'asset_key' }),
    __metadata("design:type", String)
], Asset.prototype, "assetKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Asset.prototype, "filename", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Asset.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Asset.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'asset_type' }),
    __metadata("design:type", String)
], Asset.prototype, "assetType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, name: 'mime_type' }),
    __metadata("design:type", String)
], Asset.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', name: 'file_size' }),
    __metadata("design:type", Number)
], Asset.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Asset.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Asset.prototype, "width", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], Asset.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Asset.prototype, "bucket", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'STANDARD', name: 'storage_class' }),
    __metadata("design:type", String)
], Asset.prototype, "storageClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'cdn_url' }),
    __metadata("design:type", String)
], Asset.prototype, "cdnUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'folder_id' }),
    __metadata("design:type", String)
], Asset.prototype, "folderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'tenant_id' }),
    __metadata("design:type", String)
], Asset.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'created_by' }),
    __metadata("design:type", String)
], Asset.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'updated_by' }),
    __metadata("design:type", String)
], Asset.prototype, "updatedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: AssetStatus.PROCESSING }),
    __metadata("design:type", String)
], Asset.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0, name: 'processing_progress' }),
    __metadata("design:type", Number)
], Asset.prototype, "processingProgress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}', name: 'ai_tags' }),
    __metadata("design:type", Array)
], Asset.prototype, "aiTags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'ai_objects' }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], Asset.prototype, "aiObjects", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'ai_faces' }),
    __metadata("design:type", typeof (_b = typeof Record !== "undefined" && Record) === "function" ? _b : Object)
], Asset.prototype, "aiFaces", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'ai_transcript' }),
    __metadata("design:type", String)
], Asset.prototype, "aiTranscript", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true, name: 'ai_sentiment' }),
    __metadata("design:type", String)
], Asset.prototype, "aiSentiment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'ai_safety_score' }),
    __metadata("design:type", Number)
], Asset.prototype, "aiSafetyScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'ai_features' }),
    __metadata("design:type", typeof (_c = typeof Record !== "undefined" && Record) === "function" ? _c : Object)
], Asset.prototype, "aiFeatures", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'custom_metadata' }),
    __metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], Asset.prototype, "customMetadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 1 }),
    __metadata("design:type", Number)
], Asset.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'parent_asset_id' }),
    __metadata("design:type", String)
], Asset.prototype, "parentAssetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'is_latest_version' }),
    __metadata("design:type", Boolean)
], Asset.prototype, "isLatestVersion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', name: 'created_at' }),
    __metadata("design:type", typeof (_e = typeof Date !== "undefined" && Date) === "function" ? _e : Object)
], Asset.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', name: 'updated_at' }),
    __metadata("design:type", typeof (_f = typeof Date !== "undefined" && Date) === "function" ? _f : Object)
], Asset.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'deleted_at' }),
    __metadata("design:type", typeof (_g = typeof Date !== "undefined" && Date) === "function" ? _g : Object)
], Asset.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => folder_entity_1.Folder, (folder) => folder.assets, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'folder_id' }),
    __metadata("design:type", typeof (_h = typeof folder_entity_1.Folder !== "undefined" && folder_entity_1.Folder) === "function" ? _h : Object)
], Asset.prototype, "folder", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", typeof (_j = typeof tenant_entity_1.Tenant !== "undefined" && tenant_entity_1.Tenant) === "function" ? _j : Object)
], Asset.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.createdAssets),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", typeof (_k = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _k : Object)
], Asset.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", typeof (_l = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _l : Object)
], Asset.prototype, "updatedBy", void 0);
exports.Asset = Asset = __decorate([
    (0, typeorm_1.Entity)('assets')
], Asset);


/***/ }),

/***/ "./src/auth/auth.controller.ts":
/*!*************************************!*\
  !*** ./src/auth/auth.controller.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/auth/auth.service.ts");
const register_dto_1 = __webpack_require__(/*! ./dto/register.dto */ "./src/auth/dto/register.dto.ts");
const local_auth_guard_1 = __webpack_require__(/*! ./guards/local-auth.guard */ "./src/auth/guards/local-auth.guard.ts");
const public_decorator_1 = __webpack_require__(/*! ../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const user_entity_1 = __webpack_require__(/*! ../users/entities/user.entity */ "./src/users/entities/user.entity.ts");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(user) {
        return this.authService.login(user);
    }
    async refresh(refreshToken) {
        return this.authService.refreshTokens(refreshToken);
    }
    async getProfile(user) {
        return user;
    }
    async logout() {
        return;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or username already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof register_dto_1.RegisterDto !== "undefined" && register_dto_1.RegisterDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.UseGuards)(local_auth_guard_1.LocalAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Logout current user' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Logout successful' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], AuthController);


/***/ }),

/***/ "./src/auth/auth.module.ts":
/*!*********************************!*\
  !*** ./src/auth/auth.module.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const auth_service_1 = __webpack_require__(/*! ./auth.service */ "./src/auth/auth.service.ts");
const auth_controller_1 = __webpack_require__(/*! ./auth.controller */ "./src/auth/auth.controller.ts");
const jwt_strategy_1 = __webpack_require__(/*! ./strategies/jwt.strategy */ "./src/auth/strategies/jwt.strategy.ts");
const local_strategy_1 = __webpack_require__(/*! ./strategies/local.strategy */ "./src/auth/strategies/local.strategy.ts");
const jwt_auth_guard_1 = __webpack_require__(/*! ./guards/jwt-auth.guard */ "./src/auth/guards/jwt-auth.guard.ts");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/users/users.module.ts");
const tenants_module_1 = __webpack_require__(/*! ../tenants/tenants.module */ "./src/tenants/tenants.module.ts");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            users_module_1.UsersModule,
            tenants_module_1.TenantsModule,
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('jwt.secret'),
                    signOptions: {
                        expiresIn: configService.get('jwt.expiresIn'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            local_strategy_1.LocalStrategy,
            jwt_strategy_1.JwtStrategy,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);


/***/ }),

/***/ "./src/auth/auth.service.ts":
/*!**********************************!*\
  !*** ./src/auth/auth.service.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const jwt_1 = __webpack_require__(/*! @nestjs/jwt */ "@nestjs/jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/users/users.service.ts");
const tenants_service_1 = __webpack_require__(/*! ../tenants/tenants.service */ "./src/tenants/tenants.service.ts");
const roles_service_1 = __webpack_require__(/*! ../users/roles.service */ "./src/users/roles.service.ts");
let AuthService = class AuthService {
    constructor(usersService, tenantsService, rolesService, jwtService, configService) {
        this.usersService = usersService;
        this.tenantsService = tenantsService;
        this.rolesService = rolesService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.isActive) {
            return null;
        }
        const isPasswordValid = await this.usersService.validatePassword(user, password);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    async login(user) {
        await this.usersService.updateLastLogin(user.id);
        const tokens = await this.generateTokens(user);
        return {
            user,
            tokens,
        };
    }
    async register(registerDto) {
        const tenant = await this.tenantsService.findBySlug(registerDto.tenantSlug);
        if (!tenant || !tenant.isActive) {
            throw new common_1.UnauthorizedException('Invalid tenant');
        }
        let defaultRole = await this.rolesService.findBySlug('creator', tenant.id);
        if (!defaultRole) {
            defaultRole = await this.rolesService.findBySlug('creator');
        }
        if (!defaultRole) {
            throw new Error('Default role not found. Please run database seeding.');
        }
        const user = await this.usersService.create({
            email: registerDto.email,
            password: registerDto.password,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            username: registerDto.username,
            tenantId: tenant.id,
            roleId: defaultRole.id,
        });
        const fullUser = await this.usersService.findOne(user.id);
        const tokens = await this.generateTokens(fullUser);
        return {
            user: fullUser,
            tokens,
        };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('jwt.refreshSecret'),
            });
            const user = await this.usersService.findOne(payload.sub);
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid user');
            }
            return this.generateTokens(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async validateToken(token) {
        try {
            const payload = this.jwtService.verify(token);
            return await this.usersService.findOne(payload.sub);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            tenantId: user.tenantId,
            roleId: user.roleId,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('jwt.refreshSecret'),
            expiresIn: this.configService.get('jwt.refreshExpiresIn'),
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: 86400,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof tenants_service_1.TenantsService !== "undefined" && tenants_service_1.TenantsService) === "function" ? _b : Object, typeof (_c = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _c : Object, typeof (_d = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _d : Object, typeof (_e = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _e : Object])
], AuthService);


/***/ }),

/***/ "./src/auth/dto/register.dto.ts":
/*!**************************************!*\
  !*** ./src/auth/dto/register.dto.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RegisterDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123', minLength: 8 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Doe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'johndoe' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'acme-corp' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "tenantSlug", void 0);


/***/ }),

/***/ "./src/auth/guards/jwt-auth.guard.ts":
/*!*******************************************!*\
  !*** ./src/auth/guards/jwt-auth.guard.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector) {
        super();
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], JwtAuthGuard);


/***/ }),

/***/ "./src/auth/guards/local-auth.guard.ts":
/*!*********************************************!*\
  !*** ./src/auth/guards/local-auth.guard.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalAuthGuard = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
let LocalAuthGuard = class LocalAuthGuard extends (0, passport_1.AuthGuard)('local') {
};
exports.LocalAuthGuard = LocalAuthGuard;
exports.LocalAuthGuard = LocalAuthGuard = __decorate([
    (0, common_1.Injectable)()
], LocalAuthGuard);


/***/ }),

/***/ "./src/auth/strategies/jwt.strategy.ts":
/*!*********************************************!*\
  !*** ./src/auth/strategies/jwt.strategy.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_jwt_1 = __webpack_require__(/*! passport-jwt */ "passport-jwt");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const users_service_1 = __webpack_require__(/*! ../../users/users.service */ "./src/users/users.service.ts");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, usersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('jwt.secret'),
        });
        this.configService = configService;
        this.usersService = usersService;
    }
    async validate(payload) {
        const user = await this.usersService.findOne(payload.sub);
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException();
        }
        return user;
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _b : Object])
], JwtStrategy);


/***/ }),

/***/ "./src/auth/strategies/local.strategy.ts":
/*!***********************************************!*\
  !*** ./src/auth/strategies/local.strategy.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LocalStrategy = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const passport_1 = __webpack_require__(/*! @nestjs/passport */ "@nestjs/passport");
const passport_local_1 = __webpack_require__(/*! passport-local */ "passport-local");
const auth_service_1 = __webpack_require__(/*! ../auth.service */ "./src/auth/auth.service.ts");
let LocalStrategy = class LocalStrategy extends (0, passport_1.PassportStrategy)(passport_local_1.Strategy) {
    constructor(authService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
        });
        this.authService = authService;
    }
    async validate(email, password) {
        const user = await this.authService.validateUser(email, password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
};
exports.LocalStrategy = LocalStrategy;
exports.LocalStrategy = LocalStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], LocalStrategy);


/***/ }),

/***/ "./src/common/decorators/current-user.decorator.ts":
/*!*********************************************************!*\
  !*** ./src/common/decorators/current-user.decorator.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CurrentUser = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});


/***/ }),

/***/ "./src/common/decorators/public.decorator.ts":
/*!***************************************************!*\
  !*** ./src/common/decorators/public.decorator.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Public = exports.IS_PUBLIC_KEY = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
exports.IS_PUBLIC_KEY = 'isPublic';
const Public = () => (0, common_1.SetMetadata)(exports.IS_PUBLIC_KEY, true);
exports.Public = Public;


/***/ }),

/***/ "./src/config/configuration.ts":
/*!*************************************!*\
  !*** ./src/config/configuration.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const fs_1 = __webpack_require__(/*! fs */ "fs");
function readSecret(secretName, envVar, defaultValue) {
    const secretPath = `/run/secrets/${secretName}`;
    if ((0, fs_1.existsSync)(secretPath)) {
        try {
            return (0, fs_1.readFileSync)(secretPath, 'utf8').trim();
        }
        catch (error) {
            console.warn(`Warning: Could not read secret ${secretName}: ${error.message}`);
        }
    }
    const envValue = process.env[envVar];
    if (envValue) {
        return envValue;
    }
    if (process.env.NODE_ENV === 'production' && defaultValue.includes('change')) {
        throw new Error(`Required secret ${secretName} not found. Set ${envVar} or provide Docker secret.`);
    }
    return defaultValue;
}
function validateProductionConfig(config) {
    if (config.nodeEnv !== 'production')
        return;
    const errors = [];
    if (config.jwt.secret.includes('super-secret') || config.jwt.secret.length < 32) {
        errors.push('JWT_SECRET is weak or default. Use a strong random secret.');
    }
    if (config.database.password === 'password' || config.database.password.length < 16) {
        errors.push('DATABASE_PASSWORD is weak or default. Use a strong password.');
    }
    if (config.database.synchronize) {
        errors.push('DATABASE_SYNCHRONIZE=true is dangerous in production. Use migrations.');
    }
    if (config.cors.origin.some(o => o.includes('localhost'))) {
        errors.push('CORS_ORIGIN contains localhost. Update for production domain.');
    }
    if (errors.length > 0) {
        console.error('\n========================================');
        console.error('  PRODUCTION CONFIGURATION ERRORS');
        console.error('========================================');
        errors.forEach(e => console.error(`  ✗ ${e}`));
        console.error('========================================\n');
        throw new Error('Production configuration validation failed');
    }
}
function getConfig() {
    return {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT, 10) || 4000,
        apiPrefix: process.env.API_PREFIX || 'api/v1',
        database: {
            host: process.env.DATABASE_HOST || 'localhost',
            port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
            username: process.env.DATABASE_USERNAME || 'mediax',
            password: readSecret('database_password', 'DATABASE_PASSWORD', 'password'),
            database: process.env.DATABASE_NAME || 'mediax',
            synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
            logging: process.env.DATABASE_LOGGING === 'true',
            ssl: process.env.DATABASE_SSL === 'true',
            pool: {
                min: parseInt(process.env.DATABASE_POOL_MIN, 10) || 5,
                max: parseInt(process.env.DATABASE_POOL_MAX, 10) || 20,
                idleTimeoutMillis: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT, 10) || 30000,
            },
        },
        jwt: {
            secret: readSecret('jwt_secret', 'JWT_SECRET', 'your-super-secret-jwt-key-change-this'),
            expiresIn: process.env.JWT_EXPIRATION || '1d',
            refreshSecret: readSecret('jwt_refresh_secret', 'JWT_REFRESH_SECRET', 'your-super-secret-refresh-key-change-this'),
            refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
        },
        redis: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT, 10) || 6379,
            password: readSecret('redis_password', 'REDIS_PASSWORD', ''),
            db: parseInt(process.env.REDIS_DB, 10) || 0,
        },
        minio: {
            endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
            accessKey: readSecret('minio_access_key', 'MINIO_ACCESS_KEY', 'minioadmin'),
            secretKey: readSecret('minio_secret_key', 'MINIO_SECRET_KEY', 'minioadmin'),
            buckets: {
                originals: process.env.MINIO_BUCKET_ORIGINALS || 'content-originals',
                processed: process.env.MINIO_BUCKET_PROCESSED || 'content-processed',
                artifacts: process.env.MINIO_BUCKET_ARTIFACTS || 'extraction-artifacts',
            },
            useSSL: process.env.MINIO_USE_SSL === 'true',
        },
        cdn: {
            baseUrl: process.env.CDN_BASE_URL || 'http://localhost:9000',
        },
        kafka: {
            enabled: process.env.KAFKA_ENABLED === 'true',
            brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
            clientId: process.env.KAFKA_CLIENT_ID || 'mediax-ai',
            groupId: process.env.KAFKA_GROUP_ID || 'mediax-consumers',
        },
        metadataApi: {
            url: process.env.METADATA_API_URL || 'http://localhost:3005',
        },
        upload: {
            maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5368709120,
            allowedTypes: (process.env.ALLOWED_FILE_TYPES ||
                'video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,image/jpeg,image/png,image/webp,audio/mpeg,audio/wav,audio/flac').split(','),
        },
        cors: {
            origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
            credentials: process.env.CORS_CREDENTIALS !== 'false',
        },
        rateLimit: {
            ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
            max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
        },
        logging: {
            level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
        },
    };
}
exports["default"] = () => {
    const config = getConfig();
    validateProductionConfig(config);
    return config;
};


/***/ }),

/***/ "./src/database/database.module.ts":
/*!*****************************************!*\
  !*** ./src/database/database.module.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DatabaseModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const seed_service_1 = __webpack_require__(/*! ./seed.service */ "./src/database/seed.service.ts");
const tenants_module_1 = __webpack_require__(/*! ../tenants/tenants.module */ "./src/tenants/tenants.module.ts");
const users_module_1 = __webpack_require__(/*! ../users/users.module */ "./src/users/users.module.ts");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [tenants_module_1.TenantsModule, users_module_1.UsersModule],
        providers: [seed_service_1.SeedService],
        exports: [seed_service_1.SeedService],
    })
], DatabaseModule);


/***/ }),

/***/ "./src/database/seed.service.ts":
/*!**************************************!*\
  !*** ./src/database/seed.service.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SeedService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SeedService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const tenants_service_1 = __webpack_require__(/*! ../tenants/tenants.service */ "./src/tenants/tenants.service.ts");
const roles_service_1 = __webpack_require__(/*! ../users/roles.service */ "./src/users/roles.service.ts");
const users_service_1 = __webpack_require__(/*! ../users/users.service */ "./src/users/users.service.ts");
let SeedService = SeedService_1 = class SeedService {
    constructor(tenantsService, rolesService, usersService, configService) {
        this.tenantsService = tenantsService;
        this.rolesService = rolesService;
        this.usersService = usersService;
        this.configService = configService;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async onModuleInit() {
        const nodeEnv = this.configService.get('nodeEnv');
        if (nodeEnv === 'development' || process.env.ENABLE_SEEDING === 'true') {
            this.logger.log('Starting database seeding...');
            await this.seed();
        }
    }
    async seed() {
        try {
            await this.seedRoles();
            await this.seedDefaultTenant();
            this.logger.log('Database seeding completed successfully');
        }
        catch (error) {
            this.logger.error(`Database seeding failed: ${error.message}`, error.stack);
        }
    }
    async seedRoles() {
        this.logger.log('Seeding default roles...');
        await this.rolesService.seedDefaultRoles();
        this.logger.log('Default roles seeded successfully');
    }
    async seedDefaultTenant() {
        this.logger.log('Seeding default tenant...');
        try {
            let tenant;
            try {
                tenant = await this.tenantsService.findBySlug('demo');
            }
            catch (error) {
                tenant = await this.tenantsService.create({
                    name: 'Demo Organization',
                    slug: 'demo',
                    plan: 'professional',
                    storageLimitGb: 1000,
                    settings: {
                        features: {
                            aiExtraction: true,
                            workflows: true,
                            analytics: true,
                        },
                    },
                });
                this.logger.log(`Created default tenant: ${tenant.id}`);
            }
            const adminEmail = 'admin@demo.mediax.ai';
            let adminUser;
            try {
                adminUser = await this.usersService.findByEmail(adminEmail);
            }
            catch (error) {
                const adminRole = await this.rolesService.findBySlug('admin');
                if (!adminRole) {
                    this.logger.error('Admin role not found. Cannot create admin user.');
                    return;
                }
                adminUser = await this.usersService.create({
                    email: adminEmail,
                    password: 'Admin123!',
                    firstName: 'Admin',
                    lastName: 'User',
                    username: 'admin',
                    tenantId: tenant.id,
                    roleId: adminRole.id,
                });
                this.logger.log(`Created admin user: ${adminUser.email}`);
                this.logger.log('Default admin credentials: admin@demo.mediax.ai / Admin123!');
            }
            this.logger.log('Default tenant and admin user ready');
        }
        catch (error) {
            this.logger.error(`Failed to seed default tenant: ${error.message}`, error.stack);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof tenants_service_1.TenantsService !== "undefined" && tenants_service_1.TenantsService) === "function" ? _a : Object, typeof (_b = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _b : Object, typeof (_c = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], SeedService);


/***/ }),

/***/ "./src/events/events.module.ts":
/*!*************************************!*\
  !*** ./src/events/events.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const events_service_1 = __webpack_require__(/*! ./events.service */ "./src/events/events.service.ts");
const assets_module_1 = __webpack_require__(/*! ../assets/assets.module */ "./src/assets/assets.module.ts");
let EventsModule = class EventsModule {
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, axios_1.HttpModule, (0, common_1.forwardRef)(() => assets_module_1.AssetsModule)],
        providers: [events_service_1.EventsService],
        exports: [events_service_1.EventsService],
    })
], EventsModule);


/***/ }),

/***/ "./src/events/events.service.ts":
/*!**************************************!*\
  !*** ./src/events/events.service.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventsService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EventsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const axios_1 = __webpack_require__(/*! @nestjs/axios */ "@nestjs/axios");
const kafkajs_1 = __webpack_require__(/*! kafkajs */ "kafkajs");
const assets_service_1 = __webpack_require__(/*! ../assets/assets.service */ "./src/assets/assets.service.ts");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let EventsService = EventsService_1 = class EventsService {
    constructor(configService, assetsService, httpService) {
        this.configService = configService;
        this.assetsService = assetsService;
        this.httpService = httpService;
        this.logger = new common_1.Logger(EventsService_1.name);
        this.enabled = this.configService.get('kafka.enabled');
        this.metadataApiUrl = this.configService.get('metadataApi.url');
        if (this.enabled) {
            this.kafka = new kafkajs_1.Kafka({
                brokers: this.configService.get('kafka.brokers'),
                clientId: this.configService.get('kafka.clientId'),
            });
            this.producer = this.kafka.producer();
            this.consumer = this.kafka.consumer({
                groupId: this.configService.get('kafka.groupId'),
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
            await this.consumer.subscribe({
                topics: ['metadata.enriched', 'minio.events'],
                fromBeginning: false,
            });
            await this.consumer.run({
                eachMessage: async (payload) => {
                    await this.handleMessage(payload);
                },
            });
            this.logger.log('Kafka event service initialized successfully');
        }
        catch (error) {
            this.logger.error(`Failed to initialize Kafka: ${error.message}`, error.stack);
        }
    }
    async onModuleDestroy() {
        if (!this.enabled)
            return;
        try {
            await this.producer.disconnect();
            await this.consumer.disconnect();
            this.logger.log('Kafka connections closed');
        }
        catch (error) {
            this.logger.error(`Error disconnecting Kafka: ${error.message}`);
        }
    }
    async publishAssetUploaded(event) {
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
        }
        catch (error) {
            this.logger.error(`Failed to publish asset.uploaded event: ${error.message}`, error.stack);
        }
    }
    async publishContentCreated(event) {
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
        }
        catch (error) {
            this.logger.error(`Failed to publish content.created event: ${error.message}`, error.stack);
        }
    }
    async handleMessage(payload) {
        const { topic, message } = payload;
        try {
            const value = message.value?.toString();
            if (!value)
                return;
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
        }
        catch (error) {
            this.logger.error(`Error handling message from ${topic}: ${error.message}`, error.stack);
        }
    }
    async handleMetadataEnriched(event) {
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
            const aiTags = this.extractTags({ nlp, vision, audio });
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
        }
        catch (error) {
            this.logger.error(`Failed to process metadata.enriched event: ${error.message}`, error.stack);
        }
    }
    async handleMinIOEvent(event) {
        this.logger.debug(`Received MinIO event: ${event.EventName}`);
    }
    normalizeMetadataEvent(event) {
        const features = event.features || event.data?.features || {};
        const assetId = event.assetId ||
            event.contentId ||
            event.data?.contentId ||
            event.data?.assetId;
        return {
            assetId,
            features,
        };
    }
    unwrapFeatures(features) {
        if (!features)
            return null;
        return features.features ? features.features : features;
    }
    extractTranscript(audio) {
        if (!audio)
            return null;
        if (typeof audio.transcript === 'string') {
            return audio.transcript;
        }
        if (Array.isArray(audio.segments)) {
            return audio.segments.map((segment) => segment.text).join(' ');
        }
        if (audio.transcript?.text) {
            return audio.transcript.text;
        }
        return null;
    }
    extractSentiment(nlp) {
        if (!nlp)
            return null;
        if (typeof nlp.sentiment === 'string')
            return nlp.sentiment;
        if (nlp.sentiment?.overall)
            return nlp.sentiment.overall;
        return null;
    }
    extractSafetyScore(vision) {
        if (!vision)
            return null;
        const labels = vision.safety_labels || vision.safetyLabels;
        if (!labels)
            return null;
        if (typeof labels.safe === 'number')
            return labels.safe;
        const risks = ['violence', 'explicit', 'adult', 'racy']
            .map((key) => (typeof labels[key] === 'number' ? labels[key] : 0));
        const maxRisk = Math.max(...risks, 0);
        return Math.max(0, 1 - maxRisk);
    }
    extractTags(features) {
        const tags = new Set();
        if (features.nlp?.entities) {
            features.nlp.entities.forEach((entity) => {
                const value = typeof entity === 'string'
                    ? entity
                    : entity.text || entity.label || entity.name;
                if (value)
                    tags.add(value.toLowerCase());
            });
        }
        if (features.nlp?.topics) {
            features.nlp.topics.forEach((topic) => {
                const value = typeof topic === 'string' ? topic : topic.label;
                if (value)
                    tags.add(value.toLowerCase());
            });
        }
        if (features.nlp?.keywords) {
            features.nlp.keywords.forEach((keyword) => tags.add(keyword.toLowerCase()));
        }
        if (features.vision?.objects) {
            if (Array.isArray(features.vision.objects)) {
                features.vision.objects.forEach((obj) => {
                    const value = obj.label || obj.name || obj;
                    if (value)
                        tags.add(String(value).toLowerCase());
                });
            }
            else {
                Object.values(features.vision.objects).forEach((obj) => {
                    const value = obj.label || obj.name;
                    if (value)
                        tags.add(String(value).toLowerCase());
                });
                Object.keys(features.vision.objects).forEach((key) => tags.add(key.toLowerCase()));
            }
        }
        if (features.vision?.scenes) {
            features.vision.scenes.forEach((scene) => {
                const value = scene.label || scene.description;
                if (value)
                    tags.add(String(value).toLowerCase());
            });
        }
        if (features.audio?.music_genres) {
            features.audio.music_genres.forEach((genre) => tags.add(genre.toLowerCase()));
        }
        if (features.audio?.sound_types) {
            features.audio.sound_types.forEach((sound) => tags.add(sound.toLowerCase()));
        }
        if (features.audio?.profanity_words) {
            features.audio.profanity_words.forEach((word) => tags.add(word.toLowerCase()));
        }
        return Array.from(tags);
    }
    async triggerMetadataExtraction(event) {
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
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload));
            this.logger.log(`Triggered extraction via REST for asset ${event.data.id}`);
        }
        catch (error) {
            const message = error?.response?.data || error.message;
            this.logger.error(`REST extraction trigger failed: ${message}`);
        }
    }
    async requestExtraction(params) {
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
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload));
        return response.data;
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, typeof (_b = typeof assets_service_1.AssetsService !== "undefined" && assets_service_1.AssetsService) === "function" ? _b : Object, typeof (_c = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _c : Object])
], EventsService);


/***/ }),

/***/ "./src/folders/dto/create-folder.dto.ts":
/*!**********************************************!*\
  !*** ./src/folders/dto/create-folder.dto.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateFolderDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class CreateFolderDto {
}
exports.CreateFolderDto = CreateFolderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Product Videos' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Folder containing all product videos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFolderDto.prototype, "parentFolderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], CreateFolderDto.prototype, "customMetadata", void 0);


/***/ }),

/***/ "./src/folders/dto/update-folder.dto.ts":
/*!**********************************************!*\
  !*** ./src/folders/dto/update-folder.dto.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdateFolderDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
class UpdateFolderDto {
}
exports.UpdateFolderDto = UpdateFolderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated Product Videos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFolderDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFolderDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], UpdateFolderDto.prototype, "customMetadata", void 0);


/***/ }),

/***/ "./src/folders/entities/folder.entity.ts":
/*!***********************************************!*\
  !*** ./src/folders/entities/folder.entity.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Folder = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ../../users/entities/user.entity */ "./src/users/entities/user.entity.ts");
const tenant_entity_1 = __webpack_require__(/*! ../../tenants/entities/tenant.entity */ "./src/tenants/entities/tenant.entity.ts");
const asset_entity_1 = __webpack_require__(/*! ../../assets/entities/asset.entity */ "./src/assets/entities/asset.entity.ts");
let Folder = class Folder {
};
exports.Folder = Folder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Folder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Folder.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'parent_folder_id' }),
    __metadata("design:type", String)
], Folder.prototype, "parentFolderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Folder.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], Folder.prototype, "depth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'tenant_id' }),
    __metadata("design:type", String)
], Folder.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'created_by' }),
    __metadata("design:type", String)
], Folder.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'custom_metadata' }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], Folder.prototype, "customMetadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', name: 'created_at' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Folder.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', name: 'updated_at' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Folder.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'deleted_at' }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], Folder.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Folder, (folder) => folder.children, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_folder_id' }),
    __metadata("design:type", Folder)
], Folder.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Folder, (folder) => folder.parent),
    __metadata("design:type", Array)
], Folder.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", typeof (_e = typeof tenant_entity_1.Tenant !== "undefined" && tenant_entity_1.Tenant) === "function" ? _e : Object)
], Folder.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", typeof (_f = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _f : Object)
], Folder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asset_entity_1.Asset, (asset) => asset.folder),
    __metadata("design:type", Array)
], Folder.prototype, "assets", void 0);
exports.Folder = Folder = __decorate([
    (0, typeorm_1.Entity)('folders')
], Folder);


/***/ }),

/***/ "./src/folders/folders.controller.ts":
/*!*******************************************!*\
  !*** ./src/folders/folders.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FoldersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const folders_service_1 = __webpack_require__(/*! ./folders.service */ "./src/folders/folders.service.ts");
const create_folder_dto_1 = __webpack_require__(/*! ./dto/create-folder.dto */ "./src/folders/dto/create-folder.dto.ts");
const update_folder_dto_1 = __webpack_require__(/*! ./dto/update-folder.dto */ "./src/folders/dto/update-folder.dto.ts");
const current_user_decorator_1 = __webpack_require__(/*! ../common/decorators/current-user.decorator */ "./src/common/decorators/current-user.decorator.ts");
const user_entity_1 = __webpack_require__(/*! ../users/entities/user.entity */ "./src/users/entities/user.entity.ts");
let FoldersController = class FoldersController {
    constructor(foldersService) {
        this.foldersService = foldersService;
    }
    async create(createFolderDto, user) {
        return this.foldersService.create(createFolderDto, user);
    }
    async findAll(parentId, user) {
        return this.foldersService.findAll(user.tenantId, parentId);
    }
    async getTree(user) {
        return this.foldersService.findTree(user.tenantId);
    }
    async findOne(id, user) {
        return this.foldersService.findOne(id, user.tenantId);
    }
    async update(id, updateFolderDto, user) {
        return this.foldersService.update(id, updateFolderDto, user);
    }
    async move(id, newParentId, user) {
        return this.foldersService.move(id, newParentId, user);
    }
    async delete(id, user) {
        await this.foldersService.delete(id, user);
    }
};
exports.FoldersController = FoldersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new folder' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Folder created successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_folder_dto_1.CreateFolderDto !== "undefined" && create_folder_dto_1.CreateFolderDto) === "function" ? _b : Object, typeof (_c = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List folders' }),
    (0, swagger_1.ApiQuery)({ name: 'parentId', required: false, description: 'Parent folder ID or "root"' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of folders' }),
    __param(0, (0, common_1.Query)('parentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, swagger_1.ApiOperation)({ summary: 'Get folder tree structure' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Folder tree' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get folder by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Folder found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Folder not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update folder' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Folder updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_g = typeof update_folder_dto_1.UpdateFolderDto !== "undefined" && update_folder_dto_1.UpdateFolderDto) === "function" ? _g : Object, typeof (_h = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _h : Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/move'),
    (0, swagger_1.ApiOperation)({ summary: 'Move folder to new parent' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Folder moved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid move operation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('newParentId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, typeof (_j = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _j : Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "move", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete folder' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Folder deleted' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot delete folder with children or assets' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_k = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _k : Object]),
    __metadata("design:returntype", Promise)
], FoldersController.prototype, "delete", null);
exports.FoldersController = FoldersController = __decorate([
    (0, swagger_1.ApiTags)('Folders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('folders'),
    __metadata("design:paramtypes", [typeof (_a = typeof folders_service_1.FoldersService !== "undefined" && folders_service_1.FoldersService) === "function" ? _a : Object])
], FoldersController);


/***/ }),

/***/ "./src/folders/folders.module.ts":
/*!***************************************!*\
  !*** ./src/folders/folders.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FoldersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const folder_entity_1 = __webpack_require__(/*! ./entities/folder.entity */ "./src/folders/entities/folder.entity.ts");
const folders_service_1 = __webpack_require__(/*! ./folders.service */ "./src/folders/folders.service.ts");
const folders_controller_1 = __webpack_require__(/*! ./folders.controller */ "./src/folders/folders.controller.ts");
let FoldersModule = class FoldersModule {
};
exports.FoldersModule = FoldersModule;
exports.FoldersModule = FoldersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([folder_entity_1.Folder])],
        controllers: [folders_controller_1.FoldersController],
        providers: [folders_service_1.FoldersService],
        exports: [folders_service_1.FoldersService],
    })
], FoldersModule);


/***/ }),

/***/ "./src/folders/folders.service.ts":
/*!****************************************!*\
  !*** ./src/folders/folders.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FoldersService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FoldersService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const folder_entity_1 = __webpack_require__(/*! ./entities/folder.entity */ "./src/folders/entities/folder.entity.ts");
let FoldersService = FoldersService_1 = class FoldersService {
    constructor(folderRepository) {
        this.folderRepository = folderRepository;
        this.logger = new common_1.Logger(FoldersService_1.name);
    }
    async create(createFolderDto, user) {
        let path = '/';
        let depth = 0;
        if (createFolderDto.parentFolderId) {
            const parent = await this.findOne(createFolderDto.parentFolderId, user.tenantId);
            path = `${parent.path}${parent.name}/`;
            depth = parent.depth + 1;
        }
        const folder = this.folderRepository.create({
            ...createFolderDto,
            path,
            depth,
            tenantId: user.tenantId,
            createdById: user.id,
        });
        const savedFolder = await this.folderRepository.save(folder);
        this.logger.log(`Folder created: ${savedFolder.id} by user ${user.id}`);
        return savedFolder;
    }
    async findAll(tenantId, parentFolderId) {
        const where = {
            tenantId,
            deletedAt: null,
        };
        if (parentFolderId === 'root' || parentFolderId === undefined) {
            where.parentFolderId = null;
        }
        else if (parentFolderId) {
            where.parentFolderId = parentFolderId;
        }
        return this.folderRepository.find({
            where,
            relations: ['children', 'assets'],
            order: { name: 'ASC' },
        });
    }
    async findTree(tenantId) {
        const roots = await this.folderRepository.find({
            where: { tenantId, parentFolderId: null, deletedAt: null },
            relations: ['children', 'children.children', 'children.children.children'],
            order: { name: 'ASC' },
        });
        return roots;
    }
    async findOne(id, tenantId) {
        const folder = await this.folderRepository.findOne({
            where: { id, tenantId, deletedAt: null },
            relations: ['parent', 'children', 'assets', 'createdBy'],
        });
        if (!folder) {
            throw new common_1.NotFoundException(`Folder with ID ${id} not found`);
        }
        return folder;
    }
    async update(id, updateFolderDto, user) {
        const folder = await this.findOne(id, user.tenantId);
        Object.assign(folder, updateFolderDto);
        return this.folderRepository.save(folder);
    }
    async move(id, newParentId, user) {
        const folder = await this.findOne(id, user.tenantId);
        if (newParentId === id) {
            throw new common_1.BadRequestException('Cannot move folder into itself');
        }
        if (newParentId) {
            const newParent = await this.findOne(newParentId, user.tenantId);
            if (newParent.path.startsWith(folder.path)) {
                throw new common_1.BadRequestException('Cannot move folder into its own descendant');
            }
            folder.parentFolderId = newParent.id;
            folder.path = `${newParent.path}${newParent.name}/`;
            folder.depth = newParent.depth + 1;
        }
        else {
            folder.parentFolderId = null;
            folder.path = '/';
            folder.depth = 0;
        }
        await this.updateDescendantPaths(folder);
        return this.folderRepository.save(folder);
    }
    async delete(id, user) {
        const folder = await this.findOne(id, user.tenantId);
        if (folder.children && folder.children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete folder with subfolders. Delete children first.');
        }
        if (folder.assets && folder.assets.length > 0) {
            throw new common_1.BadRequestException('Cannot delete folder with assets. Move or delete assets first.');
        }
        folder.deletedAt = new Date();
        await this.folderRepository.save(folder);
        this.logger.log(`Folder ${id} soft deleted by user ${user.id}`);
    }
    async updateDescendantPaths(folder) {
        const descendants = await this.folderRepository.find({
            where: { tenantId: folder.tenantId },
        });
        const oldPath = folder.path;
        const newPath = `${folder.path}${folder.name}/`;
        for (const descendant of descendants) {
            if (descendant.path.startsWith(oldPath) && descendant.id !== folder.id) {
                descendant.path = descendant.path.replace(oldPath, newPath);
                await this.folderRepository.save(descendant);
            }
        }
    }
};
exports.FoldersService = FoldersService;
exports.FoldersService = FoldersService = FoldersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(folder_entity_1.Folder)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], FoldersService);


/***/ }),

/***/ "./src/health/health.controller.ts":
/*!*****************************************!*\
  !*** ./src/health/health.controller.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const health_service_1 = __webpack_require__(/*! ./health.service */ "./src/health/health.service.ts");
const public_decorator_1 = __webpack_require__(/*! ../common/decorators/public.decorator */ "./src/common/decorators/public.decorator.ts");
let HealthController = class HealthController {
    constructor(healthService) {
        this.healthService = healthService;
    }
    async check() {
        return this.healthService.check();
    }
    async readiness() {
        return this.healthService.checkReadiness();
    }
    async liveness() {
        return this.healthService.checkLiveness();
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check service health status' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'ok' },
                timestamp: { type: 'string', example: '2026-01-05T10:00:00.000Z' },
                uptime: { type: 'number', example: 123.45 },
                environment: { type: 'string', example: 'development' },
                version: { type: 'string', example: '1.0.0' },
                database: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'connected' },
                        responseTime: { type: 'number', example: 5 },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is unhealthy' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if service is ready to accept traffic' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is ready',
    }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Service is not ready' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "readiness", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if service is alive' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is alive',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "liveness", null);
exports.HealthController = HealthController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeof (_a = typeof health_service_1.HealthService !== "undefined" && health_service_1.HealthService) === "function" ? _a : Object])
], HealthController);


/***/ }),

/***/ "./src/health/health.module.ts":
/*!*************************************!*\
  !*** ./src/health/health.module.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const health_controller_1 = __webpack_require__(/*! ./health.controller */ "./src/health/health.controller.ts");
const health_service_1 = __webpack_require__(/*! ./health.service */ "./src/health/health.service.ts");
let HealthModule = class HealthModule {
};
exports.HealthModule = HealthModule;
exports.HealthModule = HealthModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController],
        providers: [health_service_1.HealthService],
        exports: [health_service_1.HealthService],
    })
], HealthModule);


/***/ }),

/***/ "./src/health/health.service.ts":
/*!**************************************!*\
  !*** ./src/health/health.service.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HealthService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
let HealthService = class HealthService {
    constructor(dataSource, configService) {
        this.dataSource = dataSource;
        this.configService = configService;
    }
    async check() {
        const dbHealth = await this.checkDatabase();
        const health = {
            status: dbHealth.status === 'connected' ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: this.configService.get('nodeEnv', 'development'),
            version: '1.0.0',
            database: dbHealth,
        };
        if (health.status === 'error') {
            throw new common_1.ServiceUnavailableException(health);
        }
        return health;
    }
    async checkReadiness() {
        const dbHealth = await this.checkDatabase();
        if (dbHealth.status !== 'connected') {
            throw new common_1.ServiceUnavailableException({
                status: 'not_ready',
                reason: 'Database not connected',
            });
        }
        return {
            status: 'ready',
            timestamp: new Date().toISOString(),
        };
    }
    async checkLiveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    }
    async checkDatabase() {
        try {
            const start = Date.now();
            await this.dataSource.query('SELECT 1');
            const responseTime = Date.now() - start;
            return {
                status: 'connected',
                responseTime,
            };
        }
        catch (error) {
            return {
                status: 'disconnected',
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], HealthService);


/***/ }),

/***/ "./src/storage/storage.module.ts":
/*!***************************************!*\
  !*** ./src/storage/storage.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const storage_service_1 = __webpack_require__(/*! ./storage.service */ "./src/storage/storage.service.ts");
let StorageModule = class StorageModule {
};
exports.StorageModule = StorageModule;
exports.StorageModule = StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [storage_service_1.StorageService],
        exports: [storage_service_1.StorageService],
    })
], StorageModule);


/***/ }),

/***/ "./src/storage/storage.service.ts":
/*!****************************************!*\
  !*** ./src/storage/storage.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StorageService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const client_s3_1 = __webpack_require__(/*! @aws-sdk/client-s3 */ "@aws-sdk/client-s3");
const s3_request_presigner_1 = __webpack_require__(/*! @aws-sdk/s3-request-presigner */ "@aws-sdk/s3-request-presigner");
let StorageService = StorageService_1 = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(StorageService_1.name);
        const endpoint = this.configService.get('minio.endpoint');
        const accessKey = this.configService.get('minio.accessKey');
        const secretKey = this.configService.get('minio.secretKey');
        const useSSL = this.configService.get('minio.useSSL');
        this.s3Client = new client_s3_1.S3Client({
            endpoint,
            region: 'us-east-1',
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            forcePathStyle: true,
            tls: useSSL,
        });
        this.cdnBaseUrl = this.configService.get('cdn.baseUrl') || 'http://localhost:9000';
        this.s3PublicClient = new client_s3_1.S3Client({
            endpoint: this.cdnBaseUrl,
            region: 'us-east-1',
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            forcePathStyle: true,
            tls: useSSL,
        });
        this.buckets = this.configService.get('minio.buckets');
        this.logger.log('Storage service initialized with MinIO');
    }
    async uploadFile(file, key, bucket = this.buckets.originals, metadata, contentType) {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: file,
                ContentType: contentType || 'application/octet-stream',
                Metadata: metadata,
            });
            const response = await this.s3Client.send(command);
            this.logger.log(`File uploaded successfully: ${bucket}/${key}`);
            return {
                key,
                bucket,
                size: file.length,
                etag: response.ETag,
                url: this.getCDNUrl(bucket, key),
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getFile(key, bucket = this.buckets.originals) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            const response = await this.s3Client.send(command);
            const chunks = [];
            for await (const chunk of response.Body) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        }
        catch (error) {
            this.logger.error(`Failed to get file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async deleteFile(key, bucket = this.buckets.originals) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            this.logger.log(`File deleted successfully: ${bucket}/${key}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
            throw error;
        }
    }
    async fileExists(key, bucket = this.buckets.originals) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    async getFileMetadata(key, bucket = this.buckets.originals) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: bucket,
                Key: key,
            });
            const response = await this.s3Client.send(command);
            return {
                size: response.ContentLength,
                contentType: response.ContentType,
                lastModified: response.LastModified,
                etag: response.ETag,
                metadata: response.Metadata,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get file metadata: ${error.message}`, error.stack);
            throw error;
        }
    }
    async listFiles(prefix, bucket = this.buckets.originals, maxKeys = 1000) {
        try {
            const command = new client_s3_1.ListObjectsV2Command({
                Bucket: bucket,
                Prefix: prefix,
                MaxKeys: maxKeys,
            });
            const response = await this.s3Client.send(command);
            return response.Contents || [];
        }
        catch (error) {
            this.logger.error(`Failed to list files: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getSignedUrl(key, bucket = this.buckets.processed, options = {}) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: bucket,
                Key: key,
                ResponseContentDisposition: options.responseContentDisposition,
            });
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3PublicClient, command, {
                expiresIn: options.expiresIn || 3600,
            });
            return url;
        }
        catch (error) {
            this.logger.error(`Failed to generate signed URL: ${error.message}`, error.stack);
            throw error;
        }
    }
    getCDNUrl(bucket, key) {
        return `${this.cdnBaseUrl}/${bucket}/${key}`;
    }
    generateAssetKey(tenantId, assetId, filename, assetType) {
        const extension = filename.split('.').pop();
        const timestamp = Date.now();
        const folder = this.getFolderByType(assetType);
        return `${folder}/${tenantId}/${assetId}/${timestamp}.${extension}`;
    }
    getFolderByType(assetType) {
        const typeMap = {
            video: 'videos',
            image: 'images',
            audio: 'audio',
            document: 'documents',
        };
        return typeMap[assetType] || 'misc';
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], StorageService);


/***/ }),

/***/ "./src/tenants/entities/tenant.entity.ts":
/*!***********************************************!*\
  !*** ./src/tenants/entities/tenant.entity.ts ***!
  \***********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Tenant = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const user_entity_1 = __webpack_require__(/*! ../../users/entities/user.entity */ "./src/users/entities/user.entity.ts");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], Tenant.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'free' }),
    __metadata("design:type", String)
], Tenant.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true, name: 'storage_limit_gb' }),
    __metadata("design:type", Number)
], Tenant.prototype, "storageLimitGb", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'storage_used_gb' }),
    __metadata("design:type", Number)
], Tenant.prototype, "storageUsedGb", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'is_active' }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', name: 'created_at' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', name: 'updated_at' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Tenant.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.tenant),
    __metadata("design:type", Array)
], Tenant.prototype, "users", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)('tenants')
], Tenant);


/***/ }),

/***/ "./src/tenants/tenants.controller.ts":
/*!*******************************************!*\
  !*** ./src/tenants/tenants.controller.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const tenants_service_1 = __webpack_require__(/*! ./tenants.service */ "./src/tenants/tenants.service.ts");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async create(createTenantDto) {
        return this.tenantsService.create(createTenantDto);
    }
    async findAll() {
        return this.tenantsService.findAll();
    }
    async findOne(id) {
        return this.tenantsService.findOne(id);
    }
    async update(id, updateTenantDto) {
        return this.tenantsService.update(id, updateTenantDto);
    }
    async delete(id) {
        await this.tenantsService.delete(id);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tenant' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tenant created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Tenant with this slug already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof tenants_service_1.CreateTenantDto !== "undefined" && tenants_service_1.CreateTenantDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tenants' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of tenants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_c = typeof tenants_service_1.UpdateTenantDto !== "undefined" && tenants_service_1.UpdateTenantDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate tenant' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Tenant deactivated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "delete", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenants'),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [typeof (_a = typeof tenants_service_1.TenantsService !== "undefined" && tenants_service_1.TenantsService) === "function" ? _a : Object])
], TenantsController);


/***/ }),

/***/ "./src/tenants/tenants.module.ts":
/*!***************************************!*\
  !*** ./src/tenants/tenants.module.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const tenant_entity_1 = __webpack_require__(/*! ./entities/tenant.entity */ "./src/tenants/entities/tenant.entity.ts");
const tenants_service_1 = __webpack_require__(/*! ./tenants.service */ "./src/tenants/tenants.service.ts");
const tenants_controller_1 = __webpack_require__(/*! ./tenants.controller */ "./src/tenants/tenants.controller.ts");
let TenantsModule = class TenantsModule {
};
exports.TenantsModule = TenantsModule;
exports.TenantsModule = TenantsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant])],
        controllers: [tenants_controller_1.TenantsController],
        providers: [tenants_service_1.TenantsService],
        exports: [tenants_service_1.TenantsService],
    })
], TenantsModule);


/***/ }),

/***/ "./src/tenants/tenants.service.ts":
/*!****************************************!*\
  !*** ./src/tenants/tenants.service.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TenantsService = exports.UpdateTenantDto = exports.CreateTenantDto = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const tenant_entity_1 = __webpack_require__(/*! ./entities/tenant.entity */ "./src/tenants/entities/tenant.entity.ts");
class CreateTenantDto {
}
exports.CreateTenantDto = CreateTenantDto;
class UpdateTenantDto {
}
exports.UpdateTenantDto = UpdateTenantDto;
let TenantsService = class TenantsService {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    async create(createTenantDto) {
        const existing = await this.tenantRepository.findOne({
            where: { slug: createTenantDto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException('Tenant with this slug already exists');
        }
        const tenant = this.tenantRepository.create(createTenantDto);
        return this.tenantRepository.save(tenant);
    }
    async findAll() {
        return this.tenantRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const tenant = await this.tenantRepository.findOne({ where: { id } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${id} not found`);
        }
        return tenant;
    }
    async findBySlug(slug) {
        const tenant = await this.tenantRepository.findOne({ where: { slug } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with slug ${slug} not found`);
        }
        return tenant;
    }
    async update(id, updateTenantDto) {
        const tenant = await this.findOne(id);
        Object.assign(tenant, updateTenantDto);
        return this.tenantRepository.save(tenant);
    }
    async updateStorageUsed(id, sizeInBytes) {
        const tenant = await this.findOne(id);
        const sizeInGb = sizeInBytes / (1024 * 1024 * 1024);
        tenant.storageUsedGb = Number(tenant.storageUsedGb) + sizeInGb;
        await this.tenantRepository.save(tenant);
    }
    async delete(id) {
        const tenant = await this.findOne(id);
        tenant.isActive = false;
        await this.tenantRepository.save(tenant);
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TenantsService);


/***/ }),

/***/ "./src/users/entities/role.entity.ts":
/*!*******************************************!*\
  !*** ./src/users/entities/role.entity.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const tenant_entity_1 = __webpack_require__(/*! ../../tenants/entities/tenant.entity */ "./src/tenants/entities/tenant.entity.ts");
const user_entity_1 = __webpack_require__(/*! ./user.entity */ "./src/users/entities/user.entity.ts");
let Role = class Role {
};
exports.Role = Role;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Role.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Role.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Role.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true }),
    __metadata("design:type", Array)
], Role.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'tenant_id', nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Role.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'is_system_role' }),
    __metadata("design:type", Boolean)
], Role.prototype, "isSystemRole", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', name: 'created_at' }),
    __metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], Role.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", typeof (_b = typeof tenant_entity_1.Tenant !== "undefined" && tenant_entity_1.Tenant) === "function" ? _b : Object)
], Role.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.role),
    __metadata("design:type", Array)
], Role.prototype, "users", void 0);
exports.Role = Role = __decorate([
    (0, typeorm_1.Entity)('roles')
], Role);


/***/ }),

/***/ "./src/users/entities/user.entity.ts":
/*!*******************************************!*\
  !*** ./src/users/entities/user.entity.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const typeorm_1 = __webpack_require__(/*! typeorm */ "typeorm");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
const tenant_entity_1 = __webpack_require__(/*! ../../tenants/entities/tenant.entity */ "./src/tenants/entities/tenant.entity.ts");
const role_entity_1 = __webpack_require__(/*! ./role.entity */ "./src/users/entities/role.entity.ts");
const asset_entity_1 = __webpack_require__(/*! ../../assets/entities/asset.entity */ "./src/assets/entities/asset.entity.ts");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'local', name: 'auth_provider' }),
    __metadata("design:type", String)
], User.prototype, "authProvider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'first_name' }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'last_name' }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'avatar_url' }),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'tenant_id' }),
    __metadata("design:type", String)
], User.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'role_id' }),
    __metadata("design:type", String)
], User.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", typeof (_a = typeof Record !== "undefined" && Record) === "function" ? _a : Object)
], User.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'is_active' }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'is_email_verified' }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'mfa_enabled' }),
    __metadata("design:type", Boolean)
], User.prototype, "mfaEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'mfa_secret' }),
    __metadata("design:type", String)
], User.prototype, "mfaSecret", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', name: 'created_at' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', name: 'updated_at' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true, name: 'last_login_at' }),
    __metadata("design:type", typeof (_d = typeof Date !== "undefined" && Date) === "function" ? _d : Object)
], User.prototype, "lastLoginAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tenant_entity_1.Tenant, (tenant) => tenant.users),
    (0, typeorm_1.JoinColumn)({ name: 'tenant_id' }),
    __metadata("design:type", typeof (_e = typeof tenant_entity_1.Tenant !== "undefined" && tenant_entity_1.Tenant) === "function" ? _e : Object)
], User.prototype, "tenant", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, (role) => role.users),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", typeof (_f = typeof role_entity_1.Role !== "undefined" && role_entity_1.Role) === "function" ? _f : Object)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => asset_entity_1.Asset, (asset) => asset.createdBy),
    __metadata("design:type", Array)
], User.prototype, "createdAssets", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);


/***/ }),

/***/ "./src/users/roles.service.ts":
/*!************************************!*\
  !*** ./src/users/roles.service.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolesService = exports.UpdateRoleDto = exports.CreateRoleDto = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const role_entity_1 = __webpack_require__(/*! ./entities/role.entity */ "./src/users/entities/role.entity.ts");
class CreateRoleDto {
}
exports.CreateRoleDto = CreateRoleDto;
class UpdateRoleDto {
}
exports.UpdateRoleDto = UpdateRoleDto;
let RolesService = class RolesService {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async create(createRoleDto) {
        const existing = await this.roleRepository.findOne({
            where: {
                slug: createRoleDto.slug,
                tenantId: createRoleDto.tenantId || null,
            },
        });
        if (existing) {
            throw new common_1.ConflictException('Role with this slug already exists for this tenant');
        }
        const role = this.roleRepository.create(createRoleDto);
        return this.roleRepository.save(role);
    }
    async findAll(tenantId) {
        const where = tenantId ? [{ tenantId }, { isSystemRole: true }] : {};
        return this.roleRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const role = await this.roleRepository.findOne({ where: { id } });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }
    async findBySlug(slug, tenantId) {
        return this.roleRepository.findOne({
            where: { slug, tenantId: tenantId || null },
        });
    }
    async update(id, updateRoleDto) {
        const role = await this.findOne(id);
        if (role.isSystemRole) {
            throw new common_1.ConflictException('Cannot update system roles');
        }
        Object.assign(role, updateRoleDto);
        return this.roleRepository.save(role);
    }
    async delete(id) {
        const role = await this.findOne(id);
        if (role.isSystemRole) {
            throw new common_1.ConflictException('Cannot delete system roles');
        }
        await this.roleRepository.delete(id);
    }
    async seedDefaultRoles() {
        const defaultRoles = [
            {
                name: 'Admin',
                slug: 'admin',
                permissions: ['*'],
                description: 'Full system access',
                isSystemRole: true,
            },
            {
                name: 'Manager',
                slug: 'manager',
                permissions: [
                    'asset.*',
                    'folder.*',
                    'collection.*',
                    'workflow.create',
                    'workflow.approve',
                    'workflow.reject',
                ],
                description: 'Manage assets and workflows',
                isSystemRole: true,
            },
            {
                name: 'Creator',
                slug: 'creator',
                permissions: [
                    'asset.create',
                    'asset.read',
                    'asset.update',
                    'asset.delete',
                    'folder.create',
                    'folder.read',
                    'collection.create',
                    'collection.read',
                ],
                description: 'Create and manage own assets',
                isSystemRole: true,
            },
            {
                name: 'Reviewer',
                slug: 'reviewer',
                permissions: [
                    'asset.read',
                    'workflow.approve',
                    'workflow.reject',
                    'comment.create',
                ],
                description: 'Review and approve assets',
                isSystemRole: true,
            },
            {
                name: 'Viewer',
                slug: 'viewer',
                permissions: ['asset.read', 'folder.read', 'collection.read'],
                description: 'View and download assets',
                isSystemRole: true,
            },
        ];
        for (const roleData of defaultRoles) {
            const existing = await this.findBySlug(roleData.slug);
            if (!existing) {
                await this.create(roleData);
            }
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], RolesService);


/***/ }),

/***/ "./src/users/users.controller.ts":
/*!***************************************!*\
  !*** ./src/users/users.controller.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./src/users/users.service.ts");
const roles_service_1 = __webpack_require__(/*! ./roles.service */ "./src/users/roles.service.ts");
let UsersController = class UsersController {
    constructor(usersService, rolesService) {
        this.usersService = usersService;
        this.rolesService = rolesService;
    }
    async createUser(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    async findAllUsers(tenantId) {
        return this.usersService.findAll(tenantId);
    }
    async findOneUser(id) {
        return this.usersService.findOne(id);
    }
    async updateUser(id, updateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
    async deleteUser(id) {
        await this.usersService.delete(id);
    }
    async createRole(createRoleDto) {
        return this.rolesService.create(createRoleDto);
    }
    async findAllRoles(tenantId) {
        return this.rolesService.findAll(tenantId);
    }
    async findOneRole(id) {
        return this.rolesService.findOne(id);
    }
    async updateRole(id, updateRoleDto) {
        return this.rolesService.update(id, updateRoleDto);
    }
    async deleteRole(id) {
        await this.rolesService.delete(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email or username already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_c = typeof users_service_1.CreateUserDto !== "undefined" && users_service_1.CreateUserDto) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of users' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOneUser", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_d = typeof users_service_1.UpdateUserDto !== "undefined" && users_service_1.UpdateUserDto) === "function" ? _d : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'User deactivated' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'User not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new role' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Role created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof roles_service_1.CreateRoleDto !== "undefined" && roles_service_1.CreateRoleDto) === "function" ? _e : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createRole", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles' }),
    (0, swagger_1.ApiQuery)({ name: 'tenantId', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of roles' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllRoles", null);
__decorate([
    (0, common_1.Get)('roles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get role by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Role not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOneRole", null);
__decorate([
    (0, common_1.Put)('roles/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update role' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Role updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_f = typeof roles_service_1.UpdateRoleDto !== "undefined" && roles_service_1.UpdateRoleDto) === "function" ? _f : Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)('roles/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete role' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Role deleted' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteRole", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, typeof (_b = typeof roles_service_1.RolesService !== "undefined" && roles_service_1.RolesService) === "function" ? _b : Object])
], UsersController);


/***/ }),

/***/ "./src/users/users.module.ts":
/*!***********************************!*\
  !*** ./src/users/users.module.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const user_entity_1 = __webpack_require__(/*! ./entities/user.entity */ "./src/users/entities/user.entity.ts");
const role_entity_1 = __webpack_require__(/*! ./entities/role.entity */ "./src/users/entities/role.entity.ts");
const users_service_1 = __webpack_require__(/*! ./users.service */ "./src/users/users.service.ts");
const roles_service_1 = __webpack_require__(/*! ./roles.service */ "./src/users/roles.service.ts");
const users_controller_1 = __webpack_require__(/*! ./users.controller */ "./src/users/users.controller.ts");
const tenants_module_1 = __webpack_require__(/*! ../tenants/tenants.module */ "./src/tenants/tenants.module.ts");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, role_entity_1.Role]), tenants_module_1.TenantsModule],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, roles_service_1.RolesService],
        exports: [users_service_1.UsersService, roles_service_1.RolesService],
    })
], UsersModule);


/***/ }),

/***/ "./src/users/users.service.ts":
/*!************************************!*\
  !*** ./src/users/users.service.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UsersService = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const typeorm_1 = __webpack_require__(/*! @nestjs/typeorm */ "@nestjs/typeorm");
const typeorm_2 = __webpack_require__(/*! typeorm */ "typeorm");
const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");
const user_entity_1 = __webpack_require__(/*! ./entities/user.entity */ "./src/users/entities/user.entity.ts");
class CreateUserDto {
}
exports.CreateUserDto = CreateUserDto;
class UpdateUserDto {
}
exports.UpdateUserDto = UpdateUserDto;
let UsersService = class UsersService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto) {
        const existingEmail = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already exists');
        }
        if (createUserDto.username) {
            const existingUsername = await this.userRepository.findOne({
                where: { username: createUserDto.username },
            });
            if (existingUsername) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        const { password, ...userData } = createUserDto;
        const passwordHash = await bcrypt.hash(password, 12);
        const user = this.userRepository.create({
            ...userData,
            passwordHash,
        });
        return this.userRepository.save(user);
    }
    async findAll(tenantId) {
        const where = tenantId ? { tenantId } : {};
        return this.userRepository.find({
            where,
            relations: ['tenant', 'role'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['tenant', 'role'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email },
            relations: ['tenant', 'role'],
        });
    }
    async findByUsername(username) {
        return this.userRepository.findOne({
            where: { username },
            relations: ['tenant', 'role'],
        });
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.username && updateUserDto.username !== user.username) {
            const existingUsername = await this.findByUsername(updateUserDto.username);
            if (existingUsername && existingUsername.id !== id) {
                throw new common_1.ConflictException('Username already exists');
            }
        }
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async updatePassword(id, newPassword) {
        const user = await this.findOne(id);
        user.passwordHash = await bcrypt.hash(newPassword, 12);
        await this.userRepository.save(user);
    }
    async updateLastLogin(id) {
        await this.userRepository.update(id, { lastLoginAt: new Date() });
    }
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.passwordHash);
    }
    async delete(id) {
        const user = await this.findOne(id);
        user.isActive = false;
        await this.userRepository.save(user);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], UsersService);


/***/ }),

/***/ "@aws-sdk/client-s3":
/*!*************************************!*\
  !*** external "@aws-sdk/client-s3" ***!
  \*************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/client-s3");

/***/ }),

/***/ "@aws-sdk/s3-request-presigner":
/*!************************************************!*\
  !*** external "@aws-sdk/s3-request-presigner" ***!
  \************************************************/
/***/ ((module) => {

module.exports = require("@aws-sdk/s3-request-presigner");

/***/ }),

/***/ "@nestjs/axios":
/*!********************************!*\
  !*** external "@nestjs/axios" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/config":
/*!*********************************!*\
  !*** external "@nestjs/config" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/jwt":
/*!******************************!*\
  !*** external "@nestjs/jwt" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),

/***/ "@nestjs/passport":
/*!***********************************!*\
  !*** external "@nestjs/passport" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "@nestjs/swagger":
/*!**********************************!*\
  !*** external "@nestjs/swagger" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),

/***/ "@nestjs/typeorm":
/*!**********************************!*\
  !*** external "@nestjs/typeorm" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("bcrypt");

/***/ }),

/***/ "class-transformer":
/*!************************************!*\
  !*** external "class-transformer" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "kafkajs":
/*!**************************!*\
  !*** external "kafkajs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("kafkajs");

/***/ }),

/***/ "passport-jwt":
/*!*******************************!*\
  !*** external "passport-jwt" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),

/***/ "passport-local":
/*!*********************************!*\
  !*** external "passport-local" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("passport-local");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "typeorm":
/*!**************************!*\
  !*** external "typeorm" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const swagger_1 = __webpack_require__(/*! @nestjs/swagger */ "@nestjs/swagger");
const config_1 = __webpack_require__(/*! @nestjs/config */ "@nestjs/config");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./src/app.module.ts");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bodyParser: true,
    });
    app.use((__webpack_require__(/*! express */ "express").json)({ limit: '5gb' }));
    app.use((__webpack_require__(/*! express */ "express").urlencoded)({ limit: '5gb', extended: true }));
    const configService = app.get(config_1.ConfigService);
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(apiPrefix);
    const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
    app.enableCors({
        origin: corsOrigin.split(','),
        credentials: configService.get('CORS_CREDENTIALS', 'true') === 'true',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('GEN21 MediaX AI API')
        .setDescription('Media Asset Management Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Assets', 'Asset management endpoints')
        .addTag('Folders', 'Folder organization endpoints')
        .addTag('Users', 'User management endpoints')
        .addTag('Collections', 'Collection management endpoints')
        .addTag('Tags', 'Tag management endpoints')
        .addTag('Workflows', 'Workflow management endpoints')
        .addTag('Comments', 'Comment and annotation endpoints')
        .addTag('Analytics', 'Analytics and reporting endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const port = configService.get('PORT', 4000);
    await app.listen(port);
    console.log(`
  ====================================
  GEN21 MediaX AI API
  ====================================
  Server running on: http://localhost:${port}
  API Prefix: /${apiPrefix}
  API Docs: http://localhost:${port}/api-docs
  Environment: ${configService.get('NODE_ENV', 'development')}
  ====================================
  `);
}
bootstrap();

})();

/******/ })()
;