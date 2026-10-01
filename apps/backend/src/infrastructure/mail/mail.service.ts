import { Inject, Injectable } from "@nestjs/common";
import type { Resend } from "resend";
import { RESEND } from "./resend.provider";

interface SendTemplateOptions {
  to: string | string[];
  templateId: string;
  variables?: Record<string, string | number>;
}

@Injectable()
export class MailService {
  constructor(
    @Inject(RESEND)
    private readonly resend: Resend,
  ) {}
  async sendTemplate(options: SendTemplateOptions) {
    return this.resend.emails.send({
      to: options.to,
      template: {
        id: options.templateId,
        variables: options.variables,
      },
    });
  }
}
