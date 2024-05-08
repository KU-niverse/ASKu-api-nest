import {
  Controller,
  Get,
  Param,
  HttpCode,
  ParseIntPipe,
  HttpStatus,
  Put,
  ValidationPipe,
  Body,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UpdateUserRepBadgeDto } from 'src/user/dto/updateRepBadge.dto';
import { Badge } from 'src/badge/entities/badge.entity';

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
  getUserInfoById(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<User> {
    return this.userService.getUserById(userId);
  }

  @Put('/me/setrepbadge')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '유저 배지 수정',
    description: '유저 배지를 수정합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '유저의 대표 배지를 성공적으로 수정되었습니다.',
    type: Badge,
  })
  @ApiResponse({
    status: 404,
    description:
      '부적절한 badgeId입니다. 해당 badgeId에 해당하는 배지가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다. 유효한 userId와 badgeId가 필요합니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  async updateUserRepBadge(
    @Body(ValidationPipe) updateUserRepBadgeDto: UpdateUserRepBadgeDto,
  ): Promise<void> {
    await this.userService.updateRepBadge(
      updateUserRepBadgeDto.userId,
      updateUserRepBadgeDto.badgeId,
    );
  }
}
