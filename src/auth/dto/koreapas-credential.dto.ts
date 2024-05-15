import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Not } from 'typeorm';

export class KoreapasCredentialsDto {
  // @IsString()
  // @MinLength(4)
  // @MaxLength(20)
  @ApiProperty({ description: '유저 고파스 uuid', default: '12314154' })
  @IsNotEmpty()
  uuid: string;
  // @IsString()
  // @MinLength(4)
  // @MaxLength(20)
  //영어랑 숫자만 가능한 유효성 체크
  // @Matches(/^[a-zA-Z0-9]*$/, {
  //   message: 'password only accepts english and numbers',
  // })
  @ApiProperty({ description: '유저 닉네임', default: 'test' })
  @IsNotEmpty()
  nickname: string;
}
