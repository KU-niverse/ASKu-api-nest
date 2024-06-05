import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { WikiHistory } from './entities/wikiHistory.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { EditWikiDto } from './dto/editWiki.dto';

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

  // 위키 문서 정보 가져오기
  @Get('contents/:title')
  @ApiOperation({
    summary: '위키 문서 텍스트 가져오기',
    description: '위키 문서 텍스트를 가져옵니다. (전체 글 수정 시 사용)',
  })
  @ApiResponse({
    status: 200,
    description: '위키 문서 텍스트 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 문서',
  })
  @ApiResponse({
    status: 410,
    description: '삭제된 문서',
  })
  @ApiResponse({
    status: 500,
    description: '위키 문서 텍스트 조회 중 오류',
  })
  async getWikiContent(@Param('title') title: string, @Req() req: Request) {
    return await this.wikiService.getContents(title, req);
  }

  // 위키 문서 수정하기 및 기여도 지급
  @Post('contents/:title')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '위키 문서 수정',
    description: '위키 문서를 수정합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 문서 수정 성공',
  })
  @ApiResponse({
    status: 403,
    description: '인증된 회원만 편집 가능한 문서',
  })
  @ApiResponse({
    status: 426,
    description: '위키 문서의 최신 버전이 아님',
  })
  @ApiResponse({
    status: 500,
    description: '위키 문서 수정 중 오류',
  })
  async editWikiDocument(
    @Param('title') title: string,
    @Req() req,
    @Res() res,
    @Body() editWikiDto: EditWikiDto,
    @GetUser() user: User,
  ) {
    return this.wikiService.editWikiDoc(title, req, res, editWikiDto, user);
  }

  // 위키 문서 삭제하기
  @Delete('contents/:title')
  @UseGuards(AuthGuard())
  // TODO: AdminGuard()
  @ApiOperation({
    summary: '위키 문서 삭제',
    description: '위키 문서를 삭제합니다.',
  })
  @ApiBody({})
  @ApiResponse({
    status: 200,
    description: '위키 문서 삭제 성공',
  })
  @ApiResponse({
    status: 500,
    description: '위키 문서 삭제 중 오류',
  })
  async deleteWikiDocument(@Param('title') title: string, @Res() res) {
    try {
      const docId = await this.wikiService.getWikiDocsIdByTitle(title);
      await this.wikiService.deleteWikiDocsById(docId);
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: '위키 문서 삭제 성공' });
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: '위키 문서 삭제 중 오류' });
    }
  }

  // 모든 글 제목 조회
  @Get('titles')
  @ApiOperation({
    summary: '모든 문서 제목 조회',
    description: '모든 문서 제목을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '모든 문서 제목 조회 성공',
  })
  @ApiResponse({
    status: 500,
    description: '모든 문서 제목 조회 중 오류',
  })
  getAllTitles(): Promise<string[]> {
    return this.wikiService.getAllWikiDocs();
  }

  // 랜덤 문서 제목 조회
  @Get('random')
  @ApiOperation({
    summary: '랜덤 문서 제목 조회',
    description: '랜덤한 문서 제목을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '랜덤 문서 제목 조회 성공',
  })
  @ApiResponse({
    status: 500,
    description: '랜덤 문서 제목 조회 중 오류',
  })
  async getRandomTitle(): Promise<{ [key: string]: string | boolean }> {
    return this.wikiService.getRandomWikiDoc();
  }
}
