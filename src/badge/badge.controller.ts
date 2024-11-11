import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BadgeService } from './badge.service';
import { BadgeHistory } from './entities/badgeHistory.entity';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Badge } from './entities/badge.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
function convertKeysToSnakeCase(input: any): any {
  if (Array.isArray(input)) {
    return input.map((item) => convertKeysToSnakeCase(item));
  } else if (input instanceof Date) {
    // Date 객체인 경우 ISO 문자열로 변환
    return input.toISOString();
  } else if (typeof input === 'object' && input !== null) {
    const result: Record<string, any> = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        const value = input[key];
        result[snakeKey] = convertKeysToSnakeCase(value);
      }
    }
    return result;
  }
  return input;
}

ApiTags('badge');
@Controller('badge')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService) {}

  // TODO: 이 api 기존 api와 달라짐
  @Get('/all')
  @UseGuards(AuthGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '모든 배지 정보',
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
  @UseGuards(AuthGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '유저 배지 히스토리',
    description: '유저 배지 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
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
  async getBadgeHistory(@GetUser() user: User): Promise<BadgeHistory[]> {
    const result = await this.badgeService.getBadgeHistoryByUserId(user.id);
    const snake_result = convertKeysToSnakeCase(result);
    return snake_result;
  }
}
