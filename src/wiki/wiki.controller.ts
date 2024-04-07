import { Controller, Get, Param } from '@nestjs/common';
import { WikiService } from './wiki.service';
import { WikiDoc } from './entities/wikiDoc.entity';
import { WikiHistory } from './entities/wikiHistory.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}
  @Get('me/wikihistory/:id')
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
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '유저 로그인 되어있지 않은 상태',
  })
  @ApiResponse({
    status: 404,
    description: '해당 ID를 가진 유저가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  getMeInfo(@Param('id') id: number): Promise<WikiHistory> {
    return this.wikiService.getMyWikiHistory(id);
  }
}
