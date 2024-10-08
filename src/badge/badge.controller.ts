import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeHistory } from './entities/badgeHistory.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Badge } from './entities/badge.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('badge')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  // TODO: 이 api 기존 api와 달라짐
  @Get('/all')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '모든 배지',
    description: '존재하는 모든 배지를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '유저 배지 조회에 성공했습니다.',
    type: Badge,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  getBadgeAll(): Promise<Badge[]> {
    return this.badgeService.getBadgeAll();
  }

  @Get('me/history')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '유저 배지 히스토리',
    description: '유저 배지 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저 배지 히스토리를 성공적으로 조회했습니다.',
    type: BadgeHistory,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description:
      '해당 ID를 가진 유저가 존재하지 않습니다. 유효한 유저 ID를 입력해주세요.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 접근입니다. 배지 히스토리 불러오기에 실패하였습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
  })
  @ApiResponse({
    status: 403,
    description:
      '권한이 없습니다. 해당 유저의 배지 히스토리를 조회할 수 있는 권한이 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  getBadgeHistory(@GetUser() user: User): Promise<BadgeHistory[]> {
    return this.badgeService.getBadgeHistoryByUserId(user.id);
  }
}
