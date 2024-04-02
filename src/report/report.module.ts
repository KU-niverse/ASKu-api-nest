import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportType } from 'src/report/entities/reportType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReportType])],
})
export class ReportModule {}
