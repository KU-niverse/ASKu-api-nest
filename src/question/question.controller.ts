import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // TODO: 유저 정보 getUser로 받아오도록 수정
  // TODO: 이 api 기존 api와 달라짐
  @Get('me/history/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '유저 질문 히스토리',
    description: '유저 질문 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저 질문 히스토리 조회를 성공했습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description:
      '해당 ID를 가진 유저가 존재하지 않습니다. 유효한 유저 ID를 입력해주세요.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다. 질문 히스토리 불러오기에 실패하였습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
  })
  @ApiResponse({
    status: 403,
    description:
      '권한이 없습니다. 해당 유저의 질문 히스토리를 조회할 수 있는 권한이 없습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  getQuestionHistory(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Question[]> {
    return this.questionService.getQuestionsByUserId(userId);
  }

  // TODO: 이 api 기존 api와 달라짐
  @Get('/lookup/:id')
  @ApiOperation({
    summary: '유저 질문 히스토리',
    description: '유저 질문 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저 질문 히스토리 조회를 성공했습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 id 값입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생하였습니다.',
  })
  getQuestionById(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    return this.questionService.getQuestionById(id);
  }
}
