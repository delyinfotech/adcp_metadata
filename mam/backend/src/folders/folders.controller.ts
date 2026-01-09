import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Folders')
@ApiBearerAuth()
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({ status: 201, description: 'Folder created successfully' })
  async create(@Body() createFolderDto: CreateFolderDto, @CurrentUser() user: User) {
    return this.foldersService.create(createFolderDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List folders' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Parent folder ID or "root"' })
  @ApiResponse({ status: 200, description: 'List of folders' })
  async findAll(@Query('parentId') parentId: string, @CurrentUser() user: User) {
    return this.foldersService.findAll(user.tenantId, parentId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get folder tree structure' })
  @ApiResponse({ status: 200, description: 'Folder tree' })
  async getTree(@CurrentUser() user: User) {
    return this.foldersService.findTree(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiResponse({ status: 200, description: 'Folder found' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.foldersService.findOne(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update folder' })
  @ApiResponse({ status: 200, description: 'Folder updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @CurrentUser() user: User,
  ) {
    return this.foldersService.update(id, updateFolderDto, user);
  }

  @Put(':id/move')
  @ApiOperation({ summary: 'Move folder to new parent' })
  @ApiResponse({ status: 200, description: 'Folder moved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid move operation' })
  async move(
    @Param('id') id: string,
    @Body('newParentId') newParentId: string | null,
    @CurrentUser() user: User,
  ) {
    return this.foldersService.move(id, newParentId, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete folder' })
  @ApiResponse({ status: 204, description: 'Folder deleted' })
  @ApiResponse({ status: 400, description: 'Cannot delete folder with children or assets' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.foldersService.delete(id, user);
  }
}
