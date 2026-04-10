import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('stories')
export class StoriesController {
  constructor(private readonly service: StoriesService) {}

  @Get()
  getStories(
    @CurrentUser() user: { userId: string; tenantId: string },
  ) {
    return this.service.getStories(user.tenantId, user.userId);
  }

  @Post()
  createStory(
    @CurrentUser() user: { userId: string; tenantId: string },
    @Body() dto: CreateStoryDto,
  ) {
    return this.service.createStory(user.userId, user.tenantId, dto);
  }

  @Post(':id/view')
  registerView(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.registerView(id, user.userId);
  }

  @Get(':id/views')
  getViews(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.service.getViews(id, user.userId);
  }

  @Delete(':id')
  deleteStory(
    @CurrentUser() user: { userId: string; role: string },
    @Param('id') id: string,
  ) {
    return this.service.deleteStory(id, user.userId, user.role);
  }
}
