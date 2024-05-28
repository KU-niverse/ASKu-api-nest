import { IsNotEmpty, IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty({ message: '제목은 필수 항목입니다.' })
  @IsString({ message: '제목은 문자열이어야 합니다.' })
  title: string;

  @IsString({ message: '인덱스 제목은 문자열이어야 합니다.' })
  index_title: string;

  @IsNotEmpty({ message: '내용은 필수 항목입니다.' })
  @IsString({ message: '내용은 문자열이어야 합니다.' })
  content: string;
}
