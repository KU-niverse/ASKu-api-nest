import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { IsNull } from 'typeorm';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // TODO: 이 api 기존 api와 달라짐
  @Get('me/history/:arrange')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
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
    description: '잘못된 요청입니다. 질문 히스토리 불러오기에 실패하였습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
  })
  @ApiResponse({
    status: 402,
    description:
      '잘못된 요청입니다. arrange위치에 latest 혹은 popularity가 들어가야합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  getQuestionHistory(
    @GetUser() user: User,
    @Param('arrange') arrange: string,
  ): Promise<Question[]> {
    return this.questionService.getQuestionsByUserId(user.id, arrange);
  }

  // TODO: 이 api 기존 api와 달라짐
  @Get('/lookup/:id')
  @ApiOperation({
    summary: 'id로 질문 조회하기',
    description: '질문 목록을 조회하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '질문 목록을 조회하였습니다.',
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

  @Get('view/:flag/:title')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '질문 목록 조회',
    description: '질문 목록을 조회하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '질문 목록을 조회하였습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 flag 값입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  async getQuestionByTitle(
    @Param('flag') flag: string,
    @Param('title') title: string,
  ): Promise<any> {
    const questions = await this.questionService.getQuestionByTitle(
      title,
      flag,
    );
    return {
      success: true,
      message: '질문 목록을 조회하였습니다.',
      data: questions,
    };
  }

  @Get('query/:query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '질문 검색',
    description: '질문 제목 기반 검색',
  })
  @ApiResponse({
    status: 200,
    description: '질문 검색 성공',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 입력',
  })
  @ApiResponse({
    status: 500,
    description: '오류 발생',
  })
  async getQuestionsByQuery(@Param('query') query: string): Promise<any> {
    let decodedQuery = decodeURIComponent(query);
    if (decodedQuery.includes('%') || decodedQuery.includes('_')) {
      decodedQuery = decodedQuery.replace(/%/g, '\\%').replace(/_/g, '\\_');
    }

    const result = this.questionService.getQuestionsByQuery(decodedQuery);

    if (!result) {
      throw new BadRequestException({
        success: false,
        message: '잘못된 검색어입니다.',
      });
    } else {
      return result;
    }
  }
}
