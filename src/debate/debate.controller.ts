import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
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
import { CreateDebateDto } from 'src/debate/dto/create-debate.dto';

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

  // TODO: 이 api 기존 api와 달라짐
  // GET /debate/search/{title}/{query} 토론방 검색
  @Get('search/:title/:query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 검색에 성공하였습니다.',
    description: '토론방 목록 검색 조회 성공',
  })
  @ApiResponse({
    status: 200,
    description: '토론방 목록 검색 조회 성공',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 검색어 입력',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  getDebateListByQuery(
    @Param('title') title: string,
    @Param('query') query: string,
  ): Promise<Debate[]> {
    return this.debateService.getDebateListByQuery(title, query);
  }

  // TODO: 이 api 기존 api와 달라짐
  // GET /debate/searhcall/{query} 토론방 검색
  @Get('searchall/:query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 검색에 성공하였습니다.',
    description: '토론방 목록 검색 조회 성공',
  })
  @ApiResponse({
    status: 200,
    description: '토론방 목록 검색 조회 성공',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 검색어입니다',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  async getSearchAllDebateByQuery(
    @Param('query') query: string,
  ): Promise<Debate[]> {
    return this.debateService.getSearchAllDebateByQuery(query);
  }

  // TODO: 이 api 기존 api와 달라짐
  // POST /debate/end/{title}/{debate} 토론방 종료
  @Post('end/:subject/:debate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 종료 성공',
    description: '토론방을 종료하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토론방을 종료하였습니다.',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '이미 종료된 토론방입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  async endDebate(@Param('debate') debateId: string) {
    const result = await this.debateService.endDebate(debateId);
    return result;
  }

  // TODO: 이 api 기존 api와 달라짐
  // debate/new/{title}
  @Post('new/:title')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 생성.',
    description: '토론방 생성 성공',
  })
  @ApiResponse({
    status: 200,
    description: '토론방 생성 성공',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '토론 제목을 입력하세요.',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  @UseGuards(AuthGuard())
  async debateNewTitle(
    @Param('title') title: string,
    @Body(ValidationPipe) createDebateDto: CreateDebateDto,
    @GetUser() user: User,
  ): Promise<Omit<Debate, 'wikiDoc'>> {
    if (!createDebateDto.subject) {
      throw new BadRequestException('토론 제목을 입력하세요.');
    }
    const docId = await this.debateService.getIdByTitle(
      decodeURIComponent(title),
    );
    const newDebate: Partial<Debate> = {
      docId,
      userId: user.id,
      subject: createDebateDto.subject,
    };
    const result = await this.debateService.createDebateNewTitle(newDebate);
    return result;
  }
  
  // TODO: 이 api 기존 api와 달라짐
  // GET /debate/view/{title}/{debate} 토론방 조회
  @Get('view/:title/:debate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 메시지 조회 성공',
    description: '토론 메시지를 조회하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토론 메시지를 조회하였습니다.',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  @UseGuards(AuthGuard())
  async getDebateTitleHistory(
    @Param('title') title: string,
    @Param('debate') debateId: string,
  ): Promise<DebateHistory[]> {
    const histories = await this.debateService.getAllDebateHistoryByDebateId(+debateId);
    return histories;
  }


}
