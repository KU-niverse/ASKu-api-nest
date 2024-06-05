import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CheckReportDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: '신고 ID',
        example: 1,
    })
    reportId: number;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: '확인 여부 (1: 확인)',
        example: 1,
    })
    isChecked: number;
}