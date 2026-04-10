import { Controller, Post, Query } from '@nestjs/common';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('presigned-url')
  getPresignedUrl(
    @Query('type') type: string,
    @Query('folder') folder?: string,
  ) {
    const mediaType = type === 'video' ? 'video' : 'image';
    return this.service.getPresignedUploadUrl(mediaType, folder ?? 'uploads');
  }
}
