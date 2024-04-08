import {
  Controller,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me/editnickname/:edit')
  @ApiOperation({
    summary: '유저 토론 히스토리',
    description: '유저의 닉네임을 변경',
  })
  @ApiResponse({
    status: 200,
    description: '유저 닉네임 수정 성공',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description:
      '존재하지 않는 유저의 정보를 수정하려 했거나 중복된 항목이 존재',
  })
  @ApiResponse({
    status: 401,
    description: '빈 문자열을 입력',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  async updateNickname(@Param('nickname') nickname: string) {
    return await this.userService.updateNickname(nickname);
  }
}
