import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  // Increase body size limit for large file uploads (5GB)
  app.use(require('express').json({ limit: '5gb' }));
  app.use(require('express').urlencoded({ limit: '5gb', extended: true }));
  const configService = app.get(ConfigService);

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // CORS
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: configService.get('CORS_CREDENTIALS', 'true') === 'true',
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('GEN21 MediaX AI API')
    .setDescription('Media Asset Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Assets', 'Asset management endpoints')
    .addTag('Folders', 'Folder organization endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Collections', 'Collection management endpoints')
    .addTag('Tags', 'Tag management endpoints')
    .addTag('Workflows', 'Workflow management endpoints')
    .addTag('Comments', 'Comment and annotation endpoints')
    .addTag('Analytics', 'Analytics and reporting endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Start server
  const port = configService.get('PORT', 4000);
  await app.listen(port);

  console.log(`
  ====================================
  GEN21 MediaX AI API
  ====================================
  Server running on: http://localhost:${port}
  API Prefix: /${apiPrefix}
  API Docs: http://localhost:${port}/api-docs
  Environment: ${configService.get('NODE_ENV', 'development')}
  ====================================
  `);
}

bootstrap();
