import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckReportDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    report_id: number;
  
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    is_checked: number;
  }