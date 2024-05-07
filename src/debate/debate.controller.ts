import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { DebateService } from './debate.service';
import { Debate } from './entities/debate.entity';

@Controller('debate')
export class DebateController {
  constructor(private readonly debateService: DebateService) {}
  @Get('all/recent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '전체 토론방 목록 조회',
    description: '전체 토론방 목록 조회 성공',
  })
  @ApiResponse({
    status: 200,
    description: '전체 토론방 목록 조회 성공',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  getAllDebateByEdit(): Promise<Debate[]> {
    return this.debateService.getAllDebateByEdit();
  }

}
