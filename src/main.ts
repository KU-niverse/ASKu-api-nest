import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //swagger관련 설정 코드 추가
  const documentConfig = new DocumentBuilder()
    .setTitle('ASKu Rest API')
    .setDescription('The ASKu API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, documentConfig);
  // 노출할 문서의 경로
  SwaggerModule.setup('api-swagger', app, document);

  await app.listen(3000);
}
bootstrap();
