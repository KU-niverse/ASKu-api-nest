import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  HttpException,
  Param,
  Body,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DebateService } from './debate.service';
import { DebateHistory } from './entities/debateHistory.entity';
import { Debate } from './entities/debate.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateHistoryDto } from './dto/create-history.dto';
// import { GetUser } from 'src/auth/get-user.decorator';
import { GetUser } from '../auth/get-user.decorator';
// import { User } from 'src/user/entities/user.entity';
import { User } from '../user/entities/user.entity';

@ApiTags('debates')
@Controller('debate')
export class DebateController {
  constructor(private readonly debateService: DebateService) {}
  @Get('all/recent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '전체 토론방 목록 조회 (최신 수정 순)',
    description: '전체 토론방 목록 조회 성공',
  })
  @ApiResponse({
    status: 200,
    description: '전체 토론방 목록 조회 성공',
    schema: {
      example: {
        success: true,
        message: '전체 최신 수정순 토론방 목록을 조회하였습니다.',
        data: [
          {
            id: 2,
            doc_id: 1,
            user_id: 1,
            subject: '고양이의 방언 명칭 문제',
            created_at: '2023-08-05T11:36:11.000Z',
            recent_edited_at: '2023-08-05T11:54:04.000Z',
            done_or_not: 1,
            done_at: '2023-08-05T12:04:18.000Z',
            is_bad: 0,
            title: '고양이',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
    schema: {
      example: {
        success: false,
        message: '오류가 발생하였습니다.',
      },
    },
  })
  async getAllDebateByEdit(): Promise<any> {
    return this.debateService.getAllDebateByEdit();
  }

  // TODO: 이 api 기존 api와 달라짐
  // GET /debate/list/{title} 토론방 목록 조회(문서별, 최근 생성순)GET /debate/list/:subject 특정 주제의 토론방 목록 조회
  @Get('list/:title')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 목록 조회',
    description: '문서의 토론방 목록을 조회합니다',
  })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '토론방 목록을 조회하였습니다.' },
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
              done_or_not: { type: 'number', example: 0 },
              done_at: { type: 'string', example: null, nullable: true },
              is_bad: { type: 'number', example: 0 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '오류가 발생하였습니다.' },
      },
    },
  })
  async getDebateListByTitle(
    @Param('title') title: string,
  ): Promise<{ success: boolean; message: string; data: any[] }> {
    try {
      const debates = await this.debateService.getDebateListByTitle(
        decodeURIComponent(title),
      );

      return {
        success: true,
        message: '토론방 목록을 조회하였습니다.',
        data: debates.map((debate) => ({
          id: debate.id,
          doc_id: debate.wikiDoc.id,
          user_id: debate.userId,
          subject: debate.subject,
          created_at: debate.createdAt,
          recent_edited_at: debate.recentEditedAt,
          done_or_not: debate.doneOrNot ? 1 : 0,
          done_at: debate.doneAt,
          is_bad: debate.isBad ? 1 : 0,
        })),
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: '오류가 발생하였습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search/:title/:query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 검색',
    description: '토론방 목록 검색 조회',
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
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '잘못된 검색어입니다.' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '오류가 발생하였습니다.' },
      },
    },
  })
  async getDebateListByQuery(
    @Param('title') title: string,
    @Param('query') query: string,
  ): Promise<{ success: boolean; message: string; data: any[] }> {
    try {
      const debates = await this.debateService.getDebateListByQuery(
        title,
        query,
      );

      if (debates.length === 0) {
        throw new BadRequestException('검색 결과가 없습니다.');
      }

      const formattedDebates = debates.map((debate) => ({
        id: debate.id,
        doc_id: debate.docId,
        user_id: debate.userId,
        subject: debate.subject,
        created_at: debate.createdAt,
        recent_edited_at: debate.recentEditedAt,
        done_or_not: debate.doneOrNot ? 1 : 0,
        done_at: debate.doneAt,
        is_bad: debate.isBad ? 1 : 0,
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
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '토론방 종료',
    description: '토론방을 종료 성공',
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
    status: 401,
    description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
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
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '토론방 생성',
    description: '문서에 새로운 토론을 생성합니다',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['subject'],
      properties: {
        subject: {
          type: 'string',
          example: '고양이의 방언 명칭 문제',
          description: '토론 제목',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
          example: '토론을 생성하였습니다.',
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
                example: '2023-08-05T11:36:11.000Z',
              },
              done_or_not: { type: 'number', example: 0 },
              done_at: { type: 'string', example: null, nullable: true },
              is_bad: { type: 'number', example: 0 },
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
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '토론 제목을 입력하세요.' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '오류가 발생하였습니다.' },
      },
    },
  })
  async debateNewTitle(
    @Param('title') title: string,
    @Body() body: { subject: string },
    @GetUser() user: User,
  ): Promise<{ success: boolean; message: string; data: any[] }> {
    try {
      if (!body.subject || body.subject.trim() === '') {
        throw new BadRequestException('토론 제목을 입력하세요.');
      }

      const docId = await this.debateService.getIdByTitle(
        decodeURIComponent(title),
      );

      if (!docId) {
        throw new BadRequestException('존재하지 않는 문서입니다.');
      }

      const newDebate = {
        docId,
        userId: user.id,
        subject: body.subject,
      };

      const result = await this.debateService.createDebateNewTitle(newDebate);

      return {
        success: true,
        message: '토론을 생성하였습니다.',
        data: [
          {
            id: result.id,
            doc_id: result.docId,
            user_id: result.userId,
            subject: result.subject,
            created_at: result.createdAt,
            recent_edited_at: result.recentEditedAt,
            done_or_not: result.doneOrNot ? 1 : 0,
            done_at: result.doneAt,
            is_bad: result.isBad ? 1 : 0,
          },
        ],
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

  @Post(':title/new/:debate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '토론방에서 메세지 입력',
    description: '토론방에서 메세지 입력 성공',
  })
  @ApiResponse({
    status: 201,
    description: '토론방에서 메세지 입력 성공',
    type: Debate,
    isArray: true,
  })
  @ApiResponse({
    status: 400,
    description: '메세지 내용을 입력하세요.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
  })
  @ApiResponse({
    status: 404,
    description: '해당 토론은 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '오류가 발생했습니다.',
  })
  @ApiBody({
    description: '메시지 생성 데이터',
    type: CreateHistoryDto,
  })
  async createHistory(
    @Param('title') title: string,
    @Param('debate') debateId: number,
    @Body('content') content: string,
    @GetUser() userId: User['id'],
  ): Promise<any> {
    //return await this.debateService.createHistory(debateId, userId, content);
    const history = await this.debateService.createHistory(
      debateId,
      userId,
      content,
    );
    return {
      success: true,
      message: '토론 메시지를 생성하였습니다.',
      data: [
        {
          id: history.id,
          debate_id: history.debateId,
          user_id: history.userId,
          content: history.content,
          is_bad: history.isBad ? 1 : 0,
          created_at: history.createdAt,
        },
      ],
    };
  }

  // TODO: 이 api 기존 api와 달라짐
  @Get('view/:title/:debate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '토론방 메시지 조회',
    description: '토론 메시지를 조회합니다',
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
          example: '토론 메시지를 조회하였습니다.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 4 },
              debate_id: { type: 'number', example: 2 },
              user_id: { type: 'number', example: 1 },
              content: {
                type: 'string',
                example: '교양이라는 방언은 없습니다.',
              },
              created_at: {
                type: 'string',
                example: '2023-08-05T11:54:04.000Z',
              },
              is_bad: { type: 'number', example: 0 },
              nickname: { type: 'string', example: '고양이조아' },
              badge_image: { type: 'string', example: 'https://...' },
            },
          },
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
  @UseGuards(AuthGuard())
  async getDebateTitleHistory(
    @Param('title') title: string,
    @Param('debate') debateId: string,
  ): Promise<{ success: boolean; message: string; data: any[] }> {
    const histories =
      await this.debateService.getAllDebateHistoryByDebateId(+debateId);

    const formattedHistories = histories.map((history) => ({
      id: history.id,
      debate_id: history.debateId,
      user_id: history.userId,
      content: history.content,
      is_bad: history.isBad ? 1 : 0,
      created_at: history.createdAt,
      nickname: history.user.nickname,
      badge_image: history.user.badge.image,
    }));

    return {
      success: true,
      message: '토론 메시지를 조회하였습니다.',
      data: formattedHistories,
    };
  }
}
