import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { WikiHistory } from './entities/wikiHistory.entity';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContributionsResponseDto } from './dto/contributions-response.dto';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { EditWikiDto } from './dto/editWiki.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { WikiDoc } from './entities/wikiDoc.entity';
import { TotalContributionsListDto } from './dto/total-contributions-list.dto';
import { CreateWikiDto } from './dto/createWiki.dto';
import { WikiContributionsDto } from './dto/wiki-contributions-response.dto';
import { NotFoundError } from 'rxjs';
import { EntityNotFoundError } from 'typeorm';
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
function convertKeysToSnakeCase(input: any): any {
  if (Array.isArray(input)) {
    return input.map((item) => convertKeysToSnakeCase(item));
  } else if (input instanceof Date) {
    // Date 객체인 경우 ISO 문자열로 변환
    return input.toISOString();
  } else if (typeof input === 'object' && input !== null) {
    const result: Record<string, any> = {};
    for (const key in input) {
      if (input.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        const value = input[key];
        result[snakeKey] = convertKeysToSnakeCase(value);
      }
    }
    return result;
  }
  return input;
}
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

  // 위키 문서 텍스트 가져오기
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
  async getWikiContent(@Param('title') title: string) {
    return await this.wikiService.getContents(title);
  }

  // 위키 문서 수정하기 및 기여도 지급
  // TODO: 기여도 로직 추가 요함
  @Post('contents/:title')
  @HttpCode(HttpStatus.OK)
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
    @Body() editWikiDto: EditWikiDto,
    @GetUser() user: User,
  ) {
    return this.wikiService.editWikiDoc(title, editWikiDto, user);
  }

  // 위키 문서 삭제하기
  // @Delete('contents/:title')
  // @UseGuards(AuthGuard())
  // // TODO: AdminGuard()
  // @ApiOperation({
  //   summary: '위키 문서 삭제',
  //   description: '위키 문서를 삭제합니다.',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: '위키 문서 삭제 성공',
  // })
  // @ApiResponse({
  //   status: 500,
  //   description: '위키 문서 삭제 중 오류',
  // })
  // async deleteWikiDocument(@Param('title') title: string, @Res() res) {
  //   try {
  //     const docId = await this.wikiService.getWikiDocsIdByTitle(title);
  //     await this.wikiService.deleteWikiDocsById(docId);
  //     return res
  //       .status(HttpStatus.OK)
  //       .json({ success: true, message: '위키 문서 삭제 성공' });
  //   } catch (error) {
  //     console.error(error);
  //     // TODO: 에러 종류에 따라 다른 상태 코드 반환하도록 개선
  //     return res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .json({ success: false, message: '위키 문서 삭제 중 오류' });
  //   }
  // }

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

  // 이미지 업로드
  @Post('image')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: '이미지 업로드',
    description: '이미지를 업로드하고 이미지의 링크를 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '이미지 업로드 성공',
    schema: {
      example: {
        status: 200,
        success: true,
        url: 'https://image-bucket.kr.object.ncloudstorage.com/8ae0d3c0-35de-4801-9a3b-31d934b90e49.png',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '이미지 파일이 아니거나 파일 크기가 큼',
    schema: {
      example: {
        status: 400,
        success: false,
        message:
          '지원하지 않는 확장자입니다. or 파일 크기가 너무 큽니다. 5MB 이하의 파일을 올려주세요.',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '이미지 업로드 중 오류 발생',
    schema: {
      example: {
        status: 500,
        success: false,
        message: '서버에서 예상치 못한 오류가 발생했습니다.',
      },
    },
  })
  async uploadImage(@UploadedFile() file, @Res() res) {
    // TODO: 파일 업로드 로직을 WikiService로 이동
    try {
      console.log(file);
      return res.status(HttpStatus.OK).json({
        status: 200,
        success: true,
        url: file.location,
      });
    } catch (err) {
      if (err.message === 'Wrong extension') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 400,
          success: false,
          message: '지원하지 않는 확장자입니다.',
        });
      }
      if (err.message === 'File too large') {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 400,
          success: false,
          message: '파일 크기가 너무 큽니다. 5MB 이하의 파일을 올려주세요.',
        });
      }
      console.log(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: 500,
        success: false,
        message: '서버에서 예상치 못한 오류가 발생했습니다.',
      });
    }
  }

  // 위키 즐겨찾기 조회
  @Get('favorite')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '위키 즐겨찾기 조회',
    description: 'GET 방식으로 위키 즐겨찾기를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 즐겨찾기 조회 성공',
  })
  @ApiResponse({
    status: 500,
    description: '위키 즐겨찾기 조회 중 오류',
  })
  async getFavorite(@GetUser() user: User) {
    const result = await this.wikiService.getWikiFavoriteByUserId(user.id);
    const snake_result = convertKeysToSnakeCase(result);
    return { success: true, message: snake_result };
  }

  // 위키 즐겨찾기 추가
  @Post('favorite/:title')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '위키 즐겨찾기 추가',
    description: 'POST 방식으로 위키 즐겨찾기를 추가합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 즐겨찾기 추가 성공',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 문서입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '위키 즐겨찾기 추가 중 오류',
  })
  async addFavorite(
    @Param('title') title: string,
    @GetUser() user: User,
    @Res() res,
  ) {
    try {
      const result = await this.wikiService.addWikiFavorite(user.id, title);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error.status === 404) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: '존재하지 않는 문서입니다.' });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: '위키 즐겨찾기 추가 중 오류' });
    }
  }

  // 위키 즐겨찾기 삭제
  @Delete('favorite/:title')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '위키 즐겨찾기 삭제',
    description: 'DELETE 방식으로 위키 즐겨찾기를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 즐겨찾기 삭제 성공',
  })
  @ApiResponse({
    status: 404,
    description: '즐겨찾기에 없는 문서입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '위키 즐겨찾기 삭제 중 오류',
  })
  async deleteFavorite(@Param('title') title: string, @GetUser() user: User) {
    const result = await this.wikiService.deleteWikiFavorite(user.id, title);
    return result;
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

  //wiki/historys/{title*}
  @Get('/historys/:title')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '위키 히스토리 조회',
    description: '위키 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 히스토리 조회 성공',
  })
  @ApiResponse({
    status: 500,
    description: '위키 히스토리 조회 중 오류',
  })
  async getHistorys(@Param('title') title: string, @Res() res): Promise<void> {
    try {
      const historys = await this.wikiService.getHistorysByTitle(title);
      const snake_history = convertKeysToSnakeCase(historys);
      res
        .status(HttpStatus.OK)
        .json({ success: true, historys: snake_history });
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: '위키 히스토리 불러오기 중 오류' });
    }
  }

  //todo: auth guard 추가??
  //사용되고 있지 않은 api입니다.
  @Get('contributions/total')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '전체 기여도 리스트 조회',
    description: '문서 수정 기여도 포인트를 기반으로 전체 순위를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '랭킹 조회 성공',
  })
  @ApiResponse({
    status: 500,
    description: '랭킹 조회 중 오류 발생',
  })
  async getTotalContributions(): Promise<TotalContributionsListDto[]> {
    try {
      return await this.wikiService.getDocsContributionsList();
    } catch (error) {
      console.error('Error fetching total contributions:', error);
      throw new InternalServerErrorException(
        '랭킹 조회 중 오류가 발생했습니다.',
      );
    }
  }

  // 진권
  @Get('contributions/:title(*)')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '위키 문서 내 기여도 조회',
    description: 'GET 방식으로 위키 문서 내 기여도를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 문서 내 기여도 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 문서입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '서버에서 예상치 못한 오류가 발생했습니다.',
  })
  async getWikiContributions(
    @Param('title') title: string,
  ): Promise<WikiContributionsDto> {
    try {
      const doc_id = await this.wikiService.getWikiDocsIdByTitle(title);
      const result = await this.wikiService.getWikiContributions(doc_id);
      const snakeResult = convertKeysToSnakeCase(result);
      return snakeResult;
    } catch (error) {
      if (error.status === 404) {
        throw new NotFoundException(`위키 문서 "${title}" 존재하지 않음`);
      } else {
        throw new InternalServerErrorException(
          `위키 문서 "${title}" 기여도 조회 중 오류`,
        );
      }
    }
  }

  @Put('badhis/:hisid')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '특정 히스토리 bad로 변경',
    description:
      'PUT 방식으로 특정 히스토리를 bad로 변경하면서, 작성한 유저의 기여도와 기록 횟수도 재계산',
  })
  @ApiResponse({
    status: 200,
    description: '특정 히스토리 bad로 변경 성공',
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요한 서비스입니다.',
  })
  @ApiResponse({
    status: 403,
    description: '관리자가 아닙니다.',
  })
  @ApiResponse({
    status: 500,
    description: '히스토리 bad로 변경 중 오류',
  })
  async badHistoryPut(
    @Param('hisid') hisid: string,
    @Res() res,
    @Req() req,
  ): Promise<any> {
    try {
      const user = req.user;
      // parseInt(hisid, 10) 값은 Integer, 'NaN' 중 하나임을 이용 || 음수일 경우 제외
      if (String(parseInt(hisid, 10)) === 'NaN' || parseInt(hisid, 10) < 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: '잘못된 히스토리 ID 형식입니다.',
        });
      }
      const historyId = parseInt(hisid, 10);
      await this.wikiService.badHistoryById(historyId, user);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '히스토리 bad로 변경 성공',
      });
    } catch (err) {
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '서버에서 예상하지 못한 오류가 발생했습니다.',
      });
    }
  }
  // ↑↑↑

  @Get('query/:title')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '위키 제목을 기반으로 문서를 검색',
    description: '위키 제목을 기반으로 문서를 검색합니다.',
  })
  @ApiParam({ name: 'title', description: '검색할 위키 문서의 제목' })
  @ApiResponse({
    status: 200,
    description: '위키 문서 검색 성공',
    type: WikiDoc,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 검색어',
  })
  @ApiResponse({
    status: 500,
    description: '서버에서 예상치 못한 오류가 발생했습니다.',
  })
  async searchWikiDocsByTitle(@Param('title') title: string, @Request() req) {
    const userId = req.user ? req.user.id : 0;
    const decodedTitle = decodeURIComponent(title)
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');
    return await this.wikiService.searchWikiDocsByTitle(decodedTitle, userId);
  }

  //--------------이 아래부터 영섭 작업 --------------//

  @Get('contents/question/:questionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '같은 목차가 존재하는지 확인',
    description:
      'Get방식으로 같은 목차가 존재하는지 확인합니다. ex) based_on_section: true, section:3',
  })
  @ApiResponse({
    status: 200,
    description:
      '같은 목차 정보 가져오기 성공(based_on_section:true면 찾은거고 false면 없다는 뜻',
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요한 서비스입니다.',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 위키 문서',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @UseGuards(AuthGuard())
  async checkIndexExist(
    @GetUser() user: User,
    @Param('questionId', ParseIntPipe)
    questionId: number,
  ) {
    console.log('🚀 ~ WikiController ~ questionId:', questionId);
    const result = await this.wikiService.checkIndexExist(user, questionId);
    console.log('🚀 ~ WikiController ~ result:', result);
    return result;
  }

  @Get('contents/:title(*)/version/:version')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '위키 문서 버전 미리보기 정보 가져오기',
    description: 'GET 방식으로 위키 문서 버전 미리보기 정보를 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '	위키 문서 정보 가져오기 성공',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 위키 문서',
  })
  @ApiResponse({
    status: 410,
    description: '삭제된 위키 문서',
  })
  @ApiResponse({
    status: 500,
    description: '위키 문서 정보 가져오기 중 오류',
  })
  async getWikiContentByVersion(
    @Param('title') title: string,
    @Param('version', ParseIntPipe) version: number,
    @GetUser() user: User,
  ) {
    return await this.wikiService.getTotalContentsByVersion(
      title,
      version,
      2,
      user,
    );
  }

  @Get('contents/:title(*)/section/:section')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '위키 문서의 특정 섹션 정보 가져오기',
    description: 'GET 방식으로 위키 문서의 특정 섹션 정보를 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 문서의 특정 섹션 정보 가져오기 성공',
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요한 서비스입니다.',
  })
  @ApiResponse({
    status: 422,
    description: '잘못된 섹션 번호',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 위키 문서',
  })
  @ApiResponse({
    status: 410,
    description: '삭제된 위키 문서',
  })
  @ApiResponse({
    status: 500,
    description: '위키 문서의 특정 섹션 정보 가져오기 중 오류',
  })
  @UseGuards(AuthGuard())
  async getWikiContentBySection(
    @Param('title') title: string,
    @Param('section', ParseIntPipe) section: number,
    @GetUser() user: User,
  ) {
    return await this.wikiService.getContentsBySection(title, section, user);
  }

  // --------------이 위까지 영섭 작업 --------------//

  //wiki/historys?type={type}
  @Get('historys')
  @ApiOperation({
    summary:
      '최근 위키 히스토리 조회/실제 url은 wiki/historys?type={type} 입니다.',
    description: '최근 위키 히스토리를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '최근 위키 히스토리 조회 성공',
  })
  @ApiResponse({
    status: 500,
    description: '위키 히스토리 조회 중 오류 발생',
  })
  async getRecentHistory(
    @Query('type') type: string,
    //') type: string,
  ) {
    try {
      const history = await this.wikiService.getRecentWikiHistorys(type);
      console.log('🚀 ~ WikiController ~ history:', history);
      const snake_history = convertKeysToSnakeCase(history);
      console.log('🚀 ~ WikiController ~ snake_history:', snake_history);
      return { message: snake_history };
    } catch (error) {
      throw new InternalServerErrorException('위키 히스토리 조회 중 오류 발생');
    }
  }

  //get wiki/historys/:title(*)/version/:version
  @Get('historys/:title/version/:version')
  @ApiOperation({
    summary: '특정 버전의 위키 내용 가져오기',
    description: 'GET 방식으로 특정 버전의 위키 내용을 가져옵니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 raw 데이터 가져오기 성공',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 문서입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '위키 raw 데이터 가져오기 중 오류',
  })
  async getHistoryRaw(
    @Param('title') title: string,
    @Param('version') version: number,
    @Res() res,
  ): Promise<void> {
    try {
      const result = await this.wikiService.getHistoryRawData(title, version);
      res.status(HttpStatus.OK).json({ success: true, jsonData: result });
    } catch (error) {
      console.error(error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: '위키 raw data 불러오기 중 오류' });
    }
  }
  //post wiki/historys/:title(*)/version/:version

  @Post('/historys/:title/version/:version')
  @ApiOperation({
    summary: '특정 버전의 위키 내용 롤백',
    description: 'POST 방식으로 특정 버전의 위키 내용을 롤백합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 롤백 성공',
  })
  @ApiResponse({
    status: 403,
    description: '인증된 회원만 롤백이 가능한 문서입니다.',
  })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 문서입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '롤백 중 오류 발생',
  })
  async rollbackVersion(
    @Param('title') title: string,
    @Param('version') version: number,
    @Res() res,
    @Req() req,
  ): Promise<void> {
    try {
      const user = req.user;
      await this.wikiService.rollbackWikiVersion(title, version, user);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '위키 롤백 성공',
      });
    } catch (error) {
      if (error.status === HttpStatus.FORBIDDEN) {
        return res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          message: '인증된 회원만 롤백이 가능한 문서입니다.',
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '롤백 중 오류 발생',
      });
    }
  }

  //post wiki/contents/new/:title(*)
  @Post('/contents/new/:title')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: '새 위키 문서 생성',
    description: 'POST 방식으로 새 위키 문서를 생성합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '위키 문서 생성 성공',
  })
  @ApiResponse({
    status: 409,
    description: '이미 존재하는 문서입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '위키 생성 중 오류 발생',
  })
  async createWikiDocument(
    @Param('title') title: string,
    @Body() createWikiDto: CreateWikiDto,
    @GetUser() user: User,
    @Res() res,
  ): Promise<void> {
    try {
      const result = await this.wikiService.createNewWikiDocument(
        title,
        createWikiDto,
        user,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '위키 문서 생성 성공',
        docId: result.docId,
        version: result.version,
        count: result.count,
      });
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        return res.status(HttpStatus.CONFLICT).json({
          success: false,
          message: '이미 존재하는 문서입니다.',
          content: createWikiDto?.text || '전체',
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '위키 생성 중 오류 발생',
      });
    }
  }

  @Get('comparison/:title/rev/:rev/oldrev/:oldrev')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '두 버전 비교하기',
    description: '위키 문서의 두 버전을 비교합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '두 버전 비교 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (oldrev가 0 이하인 경우)',
  })
  @ApiResponse({
    status: 432,
    description: 'oldrev가 rev보다 크거나 같은 경우',
  })
  @ApiResponse({
    status: 404,
    description: '위키 문서를 찾을 수 없음',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  async comparisonGet(
    @Param('title') title: string,
    @Param('rev') rev: number,
    @Param('oldrev') oldrev: number,
    @Res() res,
  ) {
    try {
      if (oldrev <= 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: '잘못된 요청입니다.',
        });
      }

      if (oldrev >= rev) {
        return res.status(432).json({
          success: false,
          message: 'oldrev should be smaller than rev',
        });
      }

      const comparisonResult = await this.wikiService.compareVersions(
        title,
        rev,
        oldrev,
      );
      return res
        .status(HttpStatus.OK)
        .json({ success: true, jsonData: comparisonResult });
    } catch (err) {
      console.error(err);
      if (err.message === '위키 콘텐츠를 가져오는 중 오류가 발생했습니다.') {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '위키 문서를 찾을 수 없습니다.',
        });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '두 버전 비교 중 오류',
      });
    }
  }

  //post wiki/contents/:title(*)/section/:section
  @Post('contents/:title(*)/section/:section')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '위키 문서의 특정 섹션 정보 수정',
    description: '위키 문서의 특정 섹션 수정하기 및 기여도 지급 성공',
  })
  @ApiResponse({
    status: 200,
    description: '위키 문서의 특정 섹션 수정하기 및 기여도 지급 성공',
  })
  @ApiResponse({
    status: 401,
    description: '로그인이 필요한 서비스입니다.',
  })
  @ApiResponse({
    status: 403,
    description: '인증된 회원만 편집이 가능한 문서입니다.',
  })
  @ApiResponse({
    status: 426,
    description: 'Version is not matched',
  })
  @ApiResponse({
    status: 500,
    description: '위키 수정/히스토리 생성/기여도 부여 중 오류',
  })
  @UseGuards(AuthGuard())
  async fetchWikiSectionContent(
    @Param('title') title: string,
    @Param('section', ParseIntPipe) section: number,
    @Body() editWikiDto: EditWikiDto,
    @GetUser() user: User,
  ) {
    const result = await this.wikiService.fetchSectionContent(
      title,
      section,
      user,
      editWikiDto,
    );

    const result2 = await this.wikiService.createHistoryMid(
      result,
      editWikiDto,
      user,
    );
    const result3 = await this.wikiService.wikiChangeRecentContentMid(
      title,
      section,
      result,
      editWikiDto,
      user,
    );
    await this.wikiService.givePoint(
      user.id,
      result.diff,
      editWikiDto.is_q_based,
    );

    await this.newActionRecord(user, result.diff);
    await this.newActionRevise(user);

    if (editWikiDto.is_q_based === 1) {
      await this.newActionAnswer(user);
    }

    return result;
  }

  async newActionRecord(user: User, diff: number) {
    try {
      await this.wikiService.updateUserAction(user, diff, 'recordCount');
    } catch (err) {
      console.error(err);
      throw new Error('글자수 action 오류가 발생했습니다.');
    }
  }

  async newActionRevise(user: User) {
    try {
      await this.wikiService.updateUserAction(user, 0, 'reviseCount');
    } catch (err) {
      console.error(err);
      throw new Error('수정 action 오류가 발생했습니다.');
    }
  }

  async newActionAnswer(user: User) {
    try {
      await this.wikiService.updateUserAction(user, 0, 'answerCount');
    } catch (err) {
      console.error(err);
      throw new Error('답변 action 오류가 발생하였습니다.');
    }
  }
}
