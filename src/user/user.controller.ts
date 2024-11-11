import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  ValidationPipe,
  Body,
  UseGuards,
  InternalServerErrorException,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { UpdateUserRepBadgeDto } from 'src/user/dto/updateRepBadge.dto';
import { Badge } from 'src/badge/entities/badge.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { WikiHistoryResponseDto } from './dto/wikiHistory.dto';
import { QuestionService } from '../question/question.service';
import { Debate } from '../debate/entities/debate.entity';
import { DebateHistory } from '../debate/entities/debateHistory.entity';
import { DebateService } from '../debate/debate.service';
import { EditNickDto } from './dto/editNick.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly questionService: QuestionService,
    private readonly debateService: DebateService,
  ) {}
  @Get('mypage/info')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '내 정보 조회',
    description: '로그인되었을때 나의 아이디 기반으로 유저 정보 가져오기',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 유저 정보를 불러왔습니다.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자입니다.',
  })
  @ApiResponse({
    status: 404,
    description: '해당 ID를 가진 유저가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  async getUserInfoById(@GetUser() user: User): Promise<any> {
    try {
      const userInfo = await this.userService.getUserInfo(user.id);
      return {
        success: true,
        data: userInfo,
        message: '유저 정보를 불러오는데 성공했습니다.',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: '서버 에러',
      });
    }
  }

  @Put('/mypage/setrepbadge')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '유저 배지 수정',
    description: '유저 배지를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 대표 배지를 성공적으로 수정되었습니다.',
    type: Badge,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다. 유효한 userId와 badgeId가 필요합니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버 내부 에러가 발생했습니다.',
  })
  async updateMyRepBadge(
    @GetUser() user: User,
    @Body(ValidationPipe) updateUserRepBadgeDto: UpdateUserRepBadgeDto,
  ): Promise<void> {
    await this.userService.updateRepBadge(user, updateUserRepBadgeDto.badgeId);
  }

  @Get('mypage/wikihistory')
  @UseGuards(AuthGuard())
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '위키 히스토리 조회',
    description: '사용자의 위키 편집 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '위키 히스토리를 불러오는데 성공했습니다.',
    type: WikiHistoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '유저 로그인 되어있지 않은 상태',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '로그인이 필요합니다.' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '서버 에러' },
      },
    },
  })
  async getWikiHistory(@GetUser() user: User): Promise<any> {
    try {
      const wikiHistory: any[] = await this.userService.getWikiHistory(user.id);
      return {
        success: true,
        data: wikiHistory,
        message: '위키 히스토리를 불러오는데 성공했습니다.',
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: '서버 에러',
      });
    }
  }

  @Get('mypage/questionhistory/:arrange')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '유저 질문 히스토리',
    description: '유저 질문 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '질문 히스토리 불러오기 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '나의 질문 리스트를 최신순으로 조회하였습니다.',
        },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 50 },
              doc_id: { type: 'number', example: 6 },
              user_id: { type: 'number', example: 2 },
              index_title: { type: 'string', example: '1 개요' },
              content: { type: 'string', example: '음 잘 모르겠네~' },
              created_at: {
                type: 'string',
                example: '2023-09-03T06:11:12.000Z',
              },
              answer_or_not: { type: 'number', example: 1 },
              is_bad: { type: 'number', example: 0 },
              nickname: { type: 'string', example: '키키키키키키키' },
              rep_badge: { type: 'number', example: 1 },
              badge_image: {
                type: 'string',
                example:
                  'https://kr.object.ncloudstorage.com/image-bucket/badge/1_%EB%8B%A8%EA%B5%B0%ED%95%A0%EC%95%84%EB%B2%84%EC%A7%80%20%ED%84%B0%20%EC%9E%A1%EC%9C%BC%EC%8B%9C%EA%B3%A0.png',
              },
              like_count: { type: 'number', example: 0 },
              doc_title: { type: 'string', example: '멀틱스' },
              answer_count: { type: 'number', example: 4 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '유저 로그인 되어있지 않은 상태',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '로그인이 필요합니다.' },
      },
    },
  })
  @ApiResponse({
    status: 402,
    description: '잘못된 값을 넣었을 때',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example:
            '잘못된 요청입니다. arrange위치에 latest 혹은 popularity가 들어가야합니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '서버 에러' },
      },
    },
  })
  async getQuestionHistory(
    @GetUser() user: User,
    @Param('arrange') arrange: string,
  ): Promise<any> {
    const questions = await this.questionService.questionHistory(
      user.id,
      arrange,
    );
    return {
      success: true,
      data: questions,
      message: `나의 질문 리스트를 ${arrange === 'latest' ? '최신순' : '좋아요순'}으로 조회하였습니다.`,
    };
  }

  @Get('mypage/debatehistory')
  @HttpCode(201)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '유저 토론 히스토리',
    description: '유저의 토론 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '토론 히스토리 불러오기 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              debate_id: { type: 'number', example: 101 },
              debate_subject: { type: 'string', example: '인공지능의 장단점' },
              debate_content: {
                type: 'string',
                example:
                  '인공지능은 많은 분야에서 유용하게 사용될 수 있지만, 동시에 그것이 가져오는 부정적인 측면에 대해서도 고민해야 합니다.',
              },
              debate_content_time: {
                type: 'string',
                example: '2023-07-25T10:23:14Z',
              },
              is_bad: { type: 'boolean', example: false },
              doc_title: { type: 'string', example: '인공지능' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '서버 에러' },
      },
    },
  })
  async getMyDebateHistory(@GetUser() user: User): Promise<any> {
    try {
      const debateHistory = await this.debateService.getMyDebateHistory(
        user.id,
      );
      return {
        success: true,
        message: debateHistory,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: '서버 에러',
      });
    }
  }

  @Put('mypage/editnick')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '닉네임 수정',
    description: '사용자의 닉네임을 수정합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '닉네임 수정 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: '닉네임이 "new_nickname"으로 수정되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 또는 중복된 닉네임',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: '해당 유저가 존재하지 않거나 중복된 항목이 있습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '서버 에러' },
      },
    },
  })
  async editNick(
    @GetUser() user: User,
    @Body(ValidationPipe) editNickDto: EditNickDto,
  ) {
    try {
      const result = await this.userService.editNick(
        editNickDto.nickname,
        user.id,
      );
      if (!result) {
        return {
          success: false,
          message: '해당 유저가 존재하지 않거나 중복된 항목이 있습니다.',
        };
      }
      return {
        success: true,
        message: `닉네임이 "${editNickDto.nickname}"으로 수정되었습니다.`,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: '서버 에러',
      });
    }
  }
}
