import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DebateService } from './debate.service';
import { DebateHistory } from './entities/debateHistory.entity';
import { User } from 'src/user/entities/user.entity';

@Controller('debate')
export class DebateController {
  constructor(private readonly debateService: DebateService) {}
  @Get('me/debatehistory/:id')
  @ApiOperation({
    summary: '유저 토론 히스토리',
    description: '유저의 토론 히스토리를 조회합니다.',
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
  getMeInfo(@Param('id') id: number): Promise<DebateHistory> {
    return this.debateService.getMyDebateHistory(id);
  }
}
