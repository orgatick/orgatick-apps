import { Global, Module } from "@nestjs/common";
import { resendProvider } from "./resend.provider";
import { MailService } from "./mail.service";

@Global()
@Module({
  providers: [resendProvider, MailService],
  exports: [MailService],
})
export class MailModule {}
