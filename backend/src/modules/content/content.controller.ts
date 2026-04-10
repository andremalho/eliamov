import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateVideoDto } from './dto/create-video.dto';
import { SaveContentDto } from './dto/save-content.dto';
import { ContentQueryDto } from './dto/content-query.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('content')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  // --- Categories (before parameterized routes) ---
  @Get('categories')
  findCategories() {
    return this.service.findCategories();
  }

  // --- Saved content ---
  @Get('saved')
  getSaved(@CurrentUser() user: { userId: string }) {
    return this.service.getSavedContent(user.userId);
  }

  @Post('saved')
  saveContent(@CurrentUser() user: { userId: string }, @Body() dto: SaveContentDto) {
    return this.service.saveContent(user.userId, dto);
  }

  @Delete('saved/:id')
  removeSaved(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.service.removeSavedContent(user.userId, id);
  }

  // --- Articles ---
  @Get('articles')
  findArticles(@CurrentUser() user: { userId: string; tenantId: string }, @Query() query: ContentQueryDto) {
    return this.service.findArticles(user.tenantId, user.userId, query);
  }

  @Get('articles/:id')
  findArticle(@Param('id') id: string) {
    return this.service.findArticleById(id);
  }

  @Post('articles')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  createArticle(@CurrentUser() user: { userId: string }, @Body() dto: CreateArticleDto) {
    return this.service.createArticle(user.userId, dto);
  }

  // --- Videos ---
  @Get('videos')
  findVideos(@CurrentUser() user: { userId: string; tenantId: string }, @Query() query: ContentQueryDto) {
    return this.service.findVideos(user.tenantId, user.userId, query);
  }

  @Get('videos/:id')
  findVideo(@Param('id') id: string) {
    return this.service.findVideoById(id);
  }

  @Post('videos')
  @UseGuards(RolesGuard)
  @Roles('admin', 'tenant_admin')
  createVideo(@Body() dto: CreateVideoDto) {
    return this.service.createVideo(dto);
  }
}
