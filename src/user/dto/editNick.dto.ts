import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EditNickDto {
  @ApiProperty({
    example: 'new_nickname',
    description: '변경하고자 하는 닉네임',
  })
  @IsString()
  @IsNotEmpty({ message: '닉네임은 빈 문자열이 될 수 없습니다.' })
  nickname: string;
}