import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client } from "@aws-sdk/client-s3";

import { R2_CLIENT } from "./r2/r2.constants";
import { R2Storage } from "./r2/r2.storage";

@Module({
  providers: [
    {
      provide: R2_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new S3Client({
          region: "auto",
          endpoint: configService.getOrThrow<string>("R2_ENDPOINT"),
          credentials: {
            accessKeyId: configService.getOrThrow<string>("R2_ACCESS_KEY_ID"),
            secretAccessKey: configService.getOrThrow<string>("R2_SECRET_ACCESS_KEY"),
          },
        });
      },
    },
    R2Storage,
  ],
  exports: [R2Storage],
})
export class StorageModule {}
