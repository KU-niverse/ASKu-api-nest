import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: '질문 생성', default: '생성할 질문 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;
  index_title: string;

  @ApiProperty({ description: '문서 제목' })
  @IsNotEmpty()
  @IsString()
  title: string;
}
