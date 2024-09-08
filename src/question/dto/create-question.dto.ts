import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({ description: '질문 내용', default: '고양이는 왜 고양인가여' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: '인덱스 명', default: '0. 전체' })
  @IsNotEmpty()
  @IsString()
  index_title: string;

  @ApiProperty({ description: '문서 제목', default: '고양이' })
  @IsNotEmpty()
  @IsString()
  title: string;
}
