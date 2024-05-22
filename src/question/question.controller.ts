import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  ParseIntPipe,
  NotFoundException,
  Res,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { QueueScheduler } from 'rxjs/internal/scheduler/QueueScheduler';
import { Answer } from './entities/answer.entity';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // TODO: 이 api 기존 api와 달라짐
  @Get('me/history')
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
  getQuestionHistory(@GetUser() user: User): Promise<Question[]> {
    return this.questionService.getQuestionsByUserId(user.id);
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
  @HttpCode(HttpStatus.CREATED)
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
  getQuestionByTitle(
    @Param('flag') flag: string,
    @Param('title') title: string,
  ): Promise<Question[]> {
    return this.questionService.getQuestionByTitle(title, flag);
  }

  // TODO: 미완성, 사용불가, 위키 로직 작성된 뒤 수정 요함
  @Get('/answer/:question_id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '답변 리스트 조회',
    description: '답변 리스트를 조회하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '답변 리스트를 조회하였습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  async getAnswerByQuestionId(
    @Param('question_id') questionId: number,
    @Res() res,
  ): Promise<void> {
    try {
      const answers =
        await this.questionService.getAnswerByQuestionId(questionId);
      res.status(HttpStatus.OK).send({
        success: true,
        message: '성공적으로 답변을 조회하였습니다.',
        data: answers,
      });
    } catch (err) {
      console.error('질문을 검색하는 도중 오류가 발생했습니다:', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: '오류가 발생하였습니다.',
      });
    }
  }

  // TODO: 미완성, 사용불가, 위키 로직 작성된 뒤 수정 요함
  @Get('/answer/:question_id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '답변 리스트 조회',
    description: '답변 리스트를 조회하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '답변 리스트를 조회하였습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  async getAnswerByQuestionId(
    @Param('question_id') questionId: number,
    @Res() res,
  ): Promise<void> {
    try {
      const answers =
        await this.questionService.getAnswerByQuestionId(questionId);
      res.status(HttpStatus.OK).send({
        success: true,
        message: '성공적으로 답변을 조회하였습니다.',
        data: answers,
      });
    } catch (err) {
      console.error('질문을 검색하는 도중 오류가 발생했습니다:', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        success: false,
        message: '오류가 발생하였습니다.',
      });
    }
  }

  @Get('query/:query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '질문 검색',
    description: '질문을 검색하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '질문을 검색하였습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 검색어입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생하였습니다.',
  })
  async getQuestionsByQuery(
    @Param('query') query: string,
    @Res() res,
  ): Promise<void> {
    try {
      let decodedQuery = decodeURIComponent(query);
      if (decodedQuery.includes('%') || decodedQuery.includes('_')) {
        decodedQuery = decodedQuery.replace(/%/g, '\\%').replace(/_/g, '\\_');
      }
      if (!decodedQuery) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send({ success: false, message: '잘못된 검색어입니다.' });
      } else {
        const questions =
          await this.questionService.getQuestionsByQuery(decodedQuery);
        res.status(HttpStatus.OK).send({
          success: true,
          message: '질문을 검색하였습니다',
          data: questions,
        });
      }
    } catch (err) {
      console.error(err);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send({ success: false, message: '오류가 발생하였습니다.' });
    }
  }
}
