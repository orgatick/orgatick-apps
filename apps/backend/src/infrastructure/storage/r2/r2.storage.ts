import { GetObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { UploadFileInput, UploadFileResult } from "../storage.types";
import { R2_CLIENT } from "./r2.constants";

@Injectable()
export class R2Storage {
  constructor(
    @Inject(R2_CLIENT)
    private readonly client: S3Client,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Upload to public bucket (for public assets like logos, banners, avatars).
   */
  async uploadPublic(input: UploadFileInput): Promise<UploadFileResult> {
    const bucket = this.configService.get<string>("R2_PUBLIC_BUCKET");
    const publicUrl = this.configService.get<string>("R2_PUBLIC_URL");

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: input.key,
        Body: input.buffer,
        ContentType: input.contentType,
        ContentLength: input.contentLength,
      }),
    );

    return {
      key: input.key,
      url: `${publicUrl}/${input.key}`,
    };
  }

  /**
   * Upload to private bucket (for sensitive KYC files: PAN, GST, Aadhaar, bank records).
   */
  async uploadPrivate(input: UploadFileInput): Promise<UploadFileResult> {
    const bucket = this.configService.get<string>("R2_PRIVATE_BUCKET");

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: input.key,
        Body: input.buffer,
        ContentType: input.contentType,
        ContentLength: input.contentLength,
      }),
    );

    return {
      key: input.key,
      url: input.key,
    };
  }

  /**
   * Generate a short-lived presigned URL to securely view/download private files.
   */
  async getPrivateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const bucket = this.configService.get<string>("R2_PRIVATE_BUCKET");
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await getSignedUrl(this.client, command, { expiresIn });
  }
}
