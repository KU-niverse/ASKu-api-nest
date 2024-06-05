import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsNumber()
  @IsOptional()
  reason_id?: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}