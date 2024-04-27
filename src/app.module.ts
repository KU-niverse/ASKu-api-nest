import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BadgesModule } from './badges/badges.module';
import { UserModule } from './user/user.module';
import { WikiModule } from './wiki/wiki.module';
import { QuestionModule } from './question/question.module';
import { DebateModule } from './debate/debate.module';
import { NotificationModule } from './notification/notification.module';
import { ReportModule } from './report/report.module';
import { AdminModule } from './admin/admin.module';
import { SearchModule } from './search/search.module';
import { AiModule } from './ai/ai.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SuccessInterceptor } from 'src/success.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      port: 3306,
      host: process.env.MYSQL_HOST,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      multipleStatements: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    BadgesModule,
    UserModule,
    WikiModule,
    QuestionModule,
    DebateModule,
    NotificationModule,
    ReportModule,
    AdminModule,
    SearchModule,
    AiModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: SuccessInterceptor },
  ],
})
export class AppModule {}
