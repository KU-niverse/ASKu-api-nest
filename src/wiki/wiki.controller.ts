import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { WikiHistory } from './entities/wikiHistory.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  // TODO: 이 api 기존 api와 달라짐
  @Get('me/wikihistory/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '유저 위키 히스토리',
    description: '유저의 위키 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '위키 히스토리 불러오기 성공',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: '유저 로그인 되어있지 않은 상태',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  getWikiHistoryByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<WikiHistory[]> {
    return this.wikiService.getWikiHistoryByUserId(userId);
  }
}
