import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me/info/:userId')
  @ApiOperation({
    summary: '내 정보 조회',
    description: '로그인되었을때 나의 아이디 기반으로 유저 정보 가져오기',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 유저 정보를 불러왔습니다.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다.',
  })
  @ApiResponse({
    status: 404,
    description: '해당 ID를 가진 유저가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  getUserInfoById(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    return this.userService.getUserInfoById(userId);
  }
}
