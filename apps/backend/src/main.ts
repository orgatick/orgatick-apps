import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule, ObserveInstrument } from "./app.module";
import { initializeTransactionalContext } from "typeorm-transactional";
import cookieParser from "cookie-parser";
import { StandardSchemaValidationPipe } from "@nestjs/common";

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    forceCloseConnections: true,
    instrument: ObserveInstrument,
    // Keeps the untouched request body on `req.rawBody` so the newsletter deliverability
    // webhook can verify its HMAC signature over the exact bytes the provider sent.
    rawBody: true,
  });

  // Trust upstream reverse proxy (Cloudflare / load balancer) for accurate IP resolution
  app.set("trust proxy", true);

  app.use(cookieParser());
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 5050);
}
bootstrap().catch((error) => console.log(error));
