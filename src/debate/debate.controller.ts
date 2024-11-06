import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DebateService } from './debate.service';
import { DebateHistory } from './entities/debateHistory.entity';
import { Debate } from './entities/debate.entity';
import { AuthGuard } from '@nestjs/passport';
// import { GetUser } from 'src/auth/get-user.decorator';
import { GetUser } from '../auth/get-user.decorator';
// import { User } from 'src/user/entities/user.entity';
import { User } from '../user/entities/user.entity';

@ApiTags('debates')
@Controller('debate')
export class DebateController {
  constructor(private readonly debateService: DebateService) {}
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
    summary: '토론방 전체 검색',
    description: '키워드로 전체 토론방을 검색합니다',
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
          example: '토론방 검색에 성공하였습니다.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 2 },
              doc_id: { type: 'number', example: 1 },
              user_id: { type: 'number', example: 1 },
              subject: { type: 'string', example: '고양이의 방언 명칭 문제' },
              created_at: {
                type: 'string',
                example: '2023-08-05T11:36:11.000Z',
              },
              recent_edited_at: {
                type: 'string',
                example: '2023-08-05T11:54:04.000Z',
              },
              done_or_not: { type: 'number', example: 1 },
              done_at: {
                type: 'string',
                example: '2023-08-05T12:04:18.000Z',
                nullable: true,
              },
              is_bad: { type: 'number', example: 0 },
              title: { type: 'string', example: '고양이' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        message: {
          type: 'string',
          example: '잘못된 검색어입니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        message: {
          type: 'string',
          example: '오류가 발생하였습니다.',
        },
      },
    },
  })
  async getSearchAllDebateByQuery(
    @Param('query') query: string,
  ): Promise<{ success: boolean; message: string; data?: any[] }> {
    try {
      const debates = await this.debateService.getSearchAllDebateByQuery(query);

      if (debates.length === 0) {
        throw new BadRequestException('검색 결과가 없습니다.');
      }

      const formattedDebates = debates.map((debate) => ({
        id: debate.id,
        doc_id: debate.wikiDoc.id,
        user_id: debate.userId,
        subject: debate.subject,
        created_at: debate.createdAt,
        recent_edited_at: debate.recentEditedAt,
        done_or_not: debate.doneOrNot ? 1 : 0,
        done_at: debate.doneAt,
        is_bad: debate.isBad ? 1 : 0,
        title: debate.wikiDoc.title,
      }));

      return {
        success: true,
        message: '토론방 검색에 성공하였습니다.',
        data: formattedDebates,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException(
          {
            success: false,
            message: error.message,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        {
          success: false,
          message: '오류가 발생하였습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // POST /debate/end/{title}/{debate} 토론방 종료
  @Post('end/:title/:debate')
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
    @GetUser() user: User,
  ): Promise<Omit<Debate, 'wikiDoc'>> {
    if (!title || title.trim() === '') {
      throw new BadRequestException('토론 제목이 필요합니다.');
    }
    const docId = await this.debateService.getIdByTitle(
      decodeURIComponent(title),
    );
    const newDebate: Partial<Debate> = {
      docId,
      userId: user.id,
      subject: title,
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
    const histories =
      await this.debateService.getAllDebateHistoryByDebateId(+debateId);
    return histories;
  }
}
