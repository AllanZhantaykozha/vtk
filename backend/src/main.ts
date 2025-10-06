import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Конфигурация Swagger
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('Документация всех доступных эндпоинтов')
    .setVersion('1.0')
    .addBearerAuth() // если у тебя есть JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  app.enableCors(true);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
