import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FoldersService {
  private readonly logger = new Logger(FoldersService.name);

  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
  ) {}

  async create(createFolderDto: CreateFolderDto, user: User): Promise<Folder> {
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

  async findAll(tenantId: string, parentFolderId?: string): Promise<Folder[]> {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (parentFolderId === 'root' || parentFolderId === undefined) {
      where.parentFolderId = null;
    } else if (parentFolderId) {
      where.parentFolderId = parentFolderId;
    }

    return this.folderRepository.find({
      where,
      relations: ['children', 'assets'],
      order: { name: 'ASC' },
    });
  }

  async findTree(tenantId: string): Promise<Folder[]> {
    // Get all root folders with their entire tree
    const roots = await this.folderRepository.find({
      where: { tenantId, parentFolderId: null, deletedAt: null },
      relations: ['children', 'children.children', 'children.children.children'],
      order: { name: 'ASC' },
    });

    return roots;
  }

  async findOne(id: string, tenantId: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id, tenantId, deletedAt: null },
      relations: ['parent', 'children', 'assets', 'createdBy'],
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    return folder;
  }

  async update(id: string, updateFolderDto: UpdateFolderDto, user: User): Promise<Folder> {
    const folder = await this.findOne(id, user.tenantId);

    Object.assign(folder, updateFolderDto);

    return this.folderRepository.save(folder);
  }

  async move(id: string, newParentId: string | null, user: User): Promise<Folder> {
    const folder = await this.findOne(id, user.tenantId);

    // Prevent moving folder into itself or its descendants
    if (newParentId === id) {
      throw new BadRequestException('Cannot move folder into itself');
    }

    if (newParentId) {
      const newParent = await this.findOne(newParentId, user.tenantId);

      // Check if newParent is a descendant of folder
      if (newParent.path.startsWith(folder.path)) {
        throw new BadRequestException('Cannot move folder into its own descendant');
      }

      folder.parentFolderId = newParent.id;
      folder.path = `${newParent.path}${newParent.name}/`;
      folder.depth = newParent.depth + 1;
    } else {
      folder.parentFolderId = null;
      folder.path = '/';
      folder.depth = 0;
    }

    // Update all descendants' paths
    await this.updateDescendantPaths(folder);

    return this.folderRepository.save(folder);
  }

  async delete(id: string, user: User): Promise<void> {
    const folder = await this.findOne(id, user.tenantId);

    // Check if folder has children
    if (folder.children && folder.children.length > 0) {
      throw new BadRequestException('Cannot delete folder with subfolders. Delete children first.');
    }

    // Check if folder has assets
    if (folder.assets && folder.assets.length > 0) {
      throw new BadRequestException('Cannot delete folder with assets. Move or delete assets first.');
    }

    // Soft delete
    folder.deletedAt = new Date();
    await this.folderRepository.save(folder);

    this.logger.log(`Folder ${id} soft deleted by user ${user.id}`);
  }

  private async updateDescendantPaths(folder: Folder): Promise<void> {
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
}
