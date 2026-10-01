import { ConfigModule } from "@nestjs/config";
import { envSchema } from "./env.validation";
export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: envSchema,
  cache: true,
});
