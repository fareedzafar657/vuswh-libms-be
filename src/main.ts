import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { TrimPipe } from './pipes/trim.pipe';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const portId = process.env.BE_PORT;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Define the allowed origins
  const allowedOrigins = '*'; // Add your frontend's production URL here when deploying

  // Enable CORS for your NestJS application
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  const config = new DocumentBuilder()
    .setTitle('Library Management System (LMS)')
    .setDescription('LMS API description')
    .setVersion('1.0')
    .addTag('LMS')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalPipes(new TrimPipe());

  app.useStaticAssets(path.join(__dirname, '../uploads'));

  await app.listen(portId);
  console.log(`Libms Port is running on ${portId}`);
}
bootstrap();
