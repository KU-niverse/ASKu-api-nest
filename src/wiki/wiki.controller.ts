import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { WikiHistory } from './entities/wikiHistory.entity';
import { ContributionsResponseDto } from './dto/contributions-response.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';

@ApiTags('wiki')
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  // TODO: 이 api 기존 api와 달라짐
  @Get('me/wikihistory/:userId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '유저 위키 히스토리',
    description: '유저의 위키 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 201,
    description: '위키 히스토리 불러오기 성공',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: '유저 로그인 되어있지 않은 상태',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  getWikiHistoryByUserId(@GetUser() user: User): Promise<WikiHistory[]> {
    return this.wikiService.getWikiHistoryByUserId(user.id);
  }

  @Get('contributions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '유저의 문서별 기여도',
    description: '로그인한 유저의 문서별 기여도를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '기여도 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '유저 로그인 되어있지 않은 상태',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  getUserContributions(
    @GetUser() user: User,
  ): Promise<ContributionsResponseDto> {
    return this.wikiService.getUserContributions(user.id);
  }
}
