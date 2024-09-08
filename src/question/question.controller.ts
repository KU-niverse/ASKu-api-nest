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
  Post,
  Body,
  ValidationPipe,
  Delete,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { Answer } from './entities/answer.entity';
import { EditQuestionDto } from 'src/question/dto/edit-question.dto';
import { SuccessInterceptor } from 'src/common/interceptors/success.interceptor';
import { CreateQuestionDto } from './dto/create-question.dto';

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

    return result;
  }

  @Post('edit/:questionId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '질문 수정',
    description: '질문을 수정하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '질문을 수정하였습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '이미 답변이 달렸거나, 다른 회원의 질문입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생하였습니다.',
  })
  async editQuestion(
    @Param('questionId') questionId: number,
    @Body(ValidationPipe) editQuestionDto: EditQuestionDto,
    @GetUser() user: User,
  ): Promise<any> {
    const result = await this.questionService.updateQuestion(
      questionId,
      user.id,
      editQuestionDto,
    );

    if (result == 0) {
      throw new BadRequestException({
        success: false,
        message: '이미 답변이 달렸거나, 다른 회원의 질문입니다.',
      });
    } else if (result == 1) {
      return {
        success: true,
        message: '질문을 수정하였습니다.',
      };
    } else {
      throw new InternalServerErrorException({
        success: false,
        message: '오류가 발생하였습니다.',
      });
    }
  }

  @Post('/new/:title')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '질문 좋아요가 많은 순서대로 인기 질문을 조회',
    description: '등록 성공',
  })
  @ApiResponse({
    status: 200,
    description: '인기 질문을 조회하였습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  @HttpCode(HttpStatus.OK)
  async createQuestion(
    @Param('title') title: string,
    @Body() createQuestionDto: CreateQuestionDto,
    @GetUser() user: User,
  ): Promise<Question> {
    createQuestionDto.title = title;
    return await this.questionService.createQuestion(
      createQuestionDto,
      user.id,
    );
  }

  @Delete('delete/:questionId')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '질문 삭제',
    description: '질문 삭제',
  })
  @ApiResponse({
    status: 200,
    description: '삭제 완료',
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
  async deleteQuestion(
    @Param('questionId') questionId: number,
    @GetUser() user: User,
  ): Promise<any> {
    const result = await this.questionService.deleteQuestion(
      questionId,
      user.id,
    );
    if (result == 0) {
      throw new BadRequestException({
        success: false,
        message: '이미 답변이 달렸거나, 다른 회원의 질문입니다.',
      });
    } else if (result == 1) {
      return {
        success: true,
        message: '질문을 삭제하였습니다.',
        revised: 1,
      };
    } else {
      throw new InternalServerErrorException({
        success: false,
        message: '오류가 발생하였습니다.',
      });
    }
  }
  @Get('popular')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '질문 좋아요가 많은 순서대로 인기 질문을 조회',
    description: '인기 질문을 조회하였습니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인기 질문을 조회하였습니다.',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  async getPopularQuestion(): Promise<any> {
    const result = await this.questionService.getPopularQuestion();
    if (result) {
      return { success: true, message: '인기 질문을 조회하였습니다.', result };
    } else {
      throw new InternalServerErrorException({
        success: false,
        message: '오류가 발생하였습니다.',
      });
    }
  }
  @Post('like/:questionId')
  @UseGuards(AuthGuard())
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '질문 좋아요',
    description: '질문에 좋아요를 등록합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '좋아요 성공',
    type: Question,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '중복된 입력',
  })
  @ApiResponse({
    status: 403,
    description: '잘못된 입력',
  })
  @ApiResponse({
    status: 500,
    description: '오류 발생',
  })
  async likeQuestion(
    @Param('questionId') questionId: number,
    @GetUser() user: User,
  ): Promise<any> {
    const result = await this.questionService.likeQuestion(questionId, user.id);

    if (result === 0) {
      throw new BadRequestException({
        success: false,
        message: '이미 좋아요를 눌렀습니다.',
      });
    } else if (result === -1) {
      throw new ForbiddenException({
        success: false,
        message: '본인의 질문에는 좋아요를 누를 수 없습니다.',
      });
    } else if (result === 1) {
      return { success: true, message: '좋아요를 등록했습니다.', revised: 1 };
    } else {
      throw new InternalServerErrorException({
        success: false,
        message: '오류가 발생하였습니다.',
      });
    }
  }
}
