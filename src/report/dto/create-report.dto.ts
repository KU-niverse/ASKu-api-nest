import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    example: 1,
    description: '신고 대상 ID',
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  target: number;

  @ApiProperty({
    example: 1,
    description: '신고 사유 ID',
    required: false,
    default: 1
  })
  @IsNumber()
  @IsOptional()
  reason_id?: number;

  @ApiProperty({
    example: '스팸 링크 의심됨',
    description: '신고 상세 내용',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}