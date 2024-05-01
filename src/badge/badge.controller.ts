
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeHistory } from './entities/badgeHistory.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Badge } from './entities/badge.entity';

@Controller('badge')
export class BadgeController {
    constructor(private readonly badgeService:BadgeService) {}
    @Get('all/:id')

    @ApiOperation({summary: '유저 배지', description: '유저 배지를 조회합니다.'})
    @ApiResponse({
        status: 201,
        description: '유저 배지 조회에 성공했습니다.',
        type: Badge,
    })
    @ApiResponse({
        status: 404,
        description: '해당 ID를 가진 유저가 없습니다.',
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 접근입니다. 배지 불러오기에 실패하였습니다.',
    })
    @ApiResponse({
        status: 401,
        description: '인증되지 않은 사용자입니다.',
    })
    @ApiResponse({
        status: 403,
        description: '권한이 없습니다.',
    })
    @ApiResponse({
        status: 500,
        description: '서버 에러',
    })

    getMeBadgeAll(@Param('id') id: number): Promise<Badge> {
        return this.badgeService.getMyBadgeAll(id);
    }


  // TODO: 이 api 기존 api와 달라짐
  @Get('me/history/:userId')
  @HttpCode(HttpStatus.CREATED)
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
  getBadgeHistory(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<BadgeHistory[]> {
    return this.badgeService.getBadgeHistoryByUserId(userId);
  }
}
