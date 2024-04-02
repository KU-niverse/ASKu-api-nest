import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportReason } from 'src/report/entities/reportReason.entity';
import { ReportType } from 'src/report/entities/reportType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportType, ReportReason])],
})
export class ReportModule {}
