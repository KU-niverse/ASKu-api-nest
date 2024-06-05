import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsNumber()
  @IsNotEmpty()
  target: number;

  @IsNumber()
  @IsOptional()
  reasonId?: number;

  @IsString()
  @IsNotEmpty()
  comment: string;
}