import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomBytes } from 'crypto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKey = process.env.R2_ACCESS_KEY_ID;
    const secretKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucket = process.env.R2_BUCKET_NAME ?? 'eliamov-media';
    this.publicBaseUrl = process.env.R2_PUBLIC_URL ?? '';

    if (accountId && accessKey && secretKey) {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      });
    } else {
      this.client = null;
      this.logger.warn(
        'R2 not configured - presigned URLs will return local placeholders',
      );
    }
  }

  async getPresignedUploadUrl(
    type: 'image' | 'video',
    folder = 'uploads',
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const ext = type === 'image' ? 'jpg' : 'mp4';
    const key = `${folder}/${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`;

    if (!this.client) {
      // Fallback for dev without R2
      return {
        uploadUrl: `http://localhost:3001/uploads/${key}`,
        publicUrl: `http://localhost:3001/uploads/${key}`,
        key,
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: type === 'image' ? 'image/jpeg' : 'video/mp4',
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: 300,
    }); // 5 min
    const publicUrl = this.publicBaseUrl
      ? `${this.publicBaseUrl}/${key}`
      : uploadUrl.split('?')[0];

    return { uploadUrl, publicUrl, key };
  }

  async deleteObject(key: string): Promise<void> {
    if (!this.client) {
      this.logger.warn(`R2 not configured - skipping delete for key: ${key}`);
      return;
    }
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      this.logger.log(`Deleted R2 object: ${key}`);
    } catch (err) {
      this.logger.error(`Failed to delete R2 object: ${key}`, err as any);
    }
  }
}
