import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: '질문 생성', default: '생성할 질문 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '인덱스 제목', default: '' })
  @IsNotEmpty()
  @IsString()
  indexTitle: string;

  @ApiProperty({ description: '문서 제목', default: '' })
  @IsNotEmpty()
  @IsString()
  title: string;
}
