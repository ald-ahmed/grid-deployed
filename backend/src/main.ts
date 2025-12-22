import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { PORTS, URLS } from "../../shared/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    credentials: false,
  });

  await app.listen(PORTS.BACKEND);
  console.log(`Backend running on ${URLS.BACKEND}`);
  console.log(`GraphQL Playground available at ${URLS.BACKEND_GRAPHQL}`);
}

bootstrap();
