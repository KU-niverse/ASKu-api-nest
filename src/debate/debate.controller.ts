import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DebateService } from './debate.service';
import { DebateHistory } from './entities/debateHistory.entity';
import { Debate } from './entities/debate.entity';
import { AuthGuard } from '@nestjs/passport';
// import { GetUser } from 'src/auth/get-user.decorator';
import { GetUser } from '../auth/get-user.decorator';
// import { User } from 'src/user/entities/user.entity';
import { User } from '../user/entities/user.entity';

@Controller('debate')
export class DebateController {
  constructor(private readonly debateService: DebateService) {}

  // TODO: 이 api 기존 api와 달라짐
  // GET /user/mypage/debatehistory 유저 토론 히스토리
  @Get('me/history')
  @HttpCode(201)
  @ApiOperation({
    summary: '유저 토론 히스토리',
    description: '유저의 토론 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '위키 히스토리 불러오기 성공',
    type: Debate,
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
  @UseGuards(AuthGuard())
  getMyDebateHistory(@GetUser() user: User): Promise<DebateHistory[]> {
    return this.debateService.getMyDebateHistory(user.id);
  }

  // TODO: 이 api 기존 api와 달라짐
  // GET /debate/all/recent 최근 수정된 전체 토론방 목록 조회(전체, 최근 수정순)
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

  // TODO: 이 api 기존 api와 달라짐
  // GET /debate/list/{title} 토론방 목록 조회(문서별, 최근 생성순)GET /debate/list/:subject 특정 주제의 토론방 목록 조회
  @Get('list/:subject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 목록을 조회하였습니다.',
    description: '토론방 목록 조회 성공',
  })
  @ApiResponse({
    status: 200,
    description: '토론방 목록 조회 성공',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  getDebateListBySubject(@Param('subject') subject: string): Promise<Debate[]> {
    return this.debateService.getDebateListBySubject(subject);
  }
}
