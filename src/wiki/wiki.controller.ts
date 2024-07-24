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
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WikiService } from './wiki.service';
import { WikiHistory } from './entities/wikiHistory.entity';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { EditWikiDto } from './dto/editWiki.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';

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
    @Body() editWikiDto: EditWikiDto,
    @GetUser() user: User,
  ) {
    return this.wikiService.editWikiDoc(title, editWikiDto, user);
  }

  // 위키 문서 삭제하기
  @Delete('contents/:title')
  @UseGuards(AuthGuard())
  // TODO: AdminGuard()
  @ApiOperation({
    summary: '위키 문서 삭제',
    description: '위키 문서를 삭제합니다.',
  })
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

  // --------------이 위까지 영섭 작업 --------------//
}
