import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Not } from 'typeorm';

export class AuthCredentialsDto {
  // @MinLength(4)
  // @MaxLength(20)
  @ApiProperty({ description: '로그인 아이디', default: 'qwer1234' })
  @IsNotEmpty()
  @IsString()
  login_id: string;

  // @MinLength(4)
  // @MaxLength(20)
  //영어랑 숫자만 가능한 유효성 체크
  // @Matches(/^[a-zA-Z0-9]*$/, {
  //   message: 'password only accepts english and numbers',
  // })
  @ApiProperty({ description: '비밀번호', default: 'qwer1234@' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
