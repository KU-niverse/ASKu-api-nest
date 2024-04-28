import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Not } from 'typeorm';

export class AuthCredentialsDto {
  // @IsString()
  // @MinLength(4)
  // @MaxLength(20)
  @IsNotEmpty()
  login_id: string;
  // @IsString()
  // @MinLength(4)
  // @MaxLength(20)
  //영어랑 숫자만 가능한 유효성 체크
  // @Matches(/^[a-zA-Z0-9]*$/, {
  //   message: 'password only accepts english and numbers',
  // })

  @IsNotEmpty()
  password: string;
}
