import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Report } from 'src/report/entities/report.entity';
import { ReportReason } from 'src/report/entities/reportReason.entity';
import { ReportType } from 'src/report/entities/reportType.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { WikiModule } from 'src/wiki/wiki.module';
import { DebateModule } from 'src/debate/debate.module';
import { QuestionModule } from 'src/question/question.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportType, ReportReason, Report]),
    AuthModule,
    DebateModule,
    QuestionModule,
    WikiModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [TypeOrmModule, ReportService],
})
export class ReportModule {}
