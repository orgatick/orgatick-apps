import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
export const RESEND = "RESEND";

export const resendProvider = {
  provide: RESEND,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const apiKey = configService.getOrThrow<string>("RESEND_API_KEY");

    return new Resend(apiKey);
  },
};
