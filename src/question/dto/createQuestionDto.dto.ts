import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: '수정된 질문 내용', default: '수정된 질문 내용' })
  @IsNotEmpty()
  @IsString()
  content: string;
  index_title: string;
}
