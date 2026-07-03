import { config } from 'dotenv';
config();
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
(async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  // app.use();
  app.enableCors({ origin: '*' });

  const options = new DocumentBuilder()
    .setTitle('this is documentation for api`s')
    .setDescription(
      'you can use this for understand how this app apis work and how you can use them',
    )
    .setVersion('1.0.0')
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT);
})();
