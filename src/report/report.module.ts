import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Report } from 'src/report/entities/report.entity';
import { ReportReason } from 'src/report/entities/reportReason.entity';
import { ReportType } from 'src/report/entities/reportType.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReportType, ReportReason, Report]),
  AuthModule], 
  controllers:[ReportController],
  providers: [ReportService],
})
export class ReportModule {}
