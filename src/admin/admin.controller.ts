import {
  Controller,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AuthGuard())
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('docsviews')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '문서 조회수 순위 조회',
    description: '모든 문서의 조회수를 내림차순으로 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '성공적으로 문서 조회수 순위를 가져왔습니다.',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              title: { type: 'string', example: '복돌이' },
              text_pointer: {
                type: 'string',
                example: 'asfieojaosdjfs3alsefj.asiefjosjd',
              },
              latest_ver: { type: 'number', example: 1 },
              type: { type: 'string', example: 'doc' },
              is_deleted: { type: 'number', example: 0 },
              recent_filtered_content: {
                type: 'string',
                example: '복돌이는 귀여워, 이건 문서본문 내용입니다!!',
              },
              created_at: {
                type: 'string',
                example: '2023-08-03T13:16:16.000Z',
              },
            },
          },
        },
        message: {
          type: 'string',
          example: '성공적으로 문서 조회수 순위를 가져왔습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '로그인 되지 않은 유저가 해당 api호출',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '로그인이 필요합니다.' },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '관리자가 아닌 유저가 해당 api호출',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '관리자가 아닙니다.' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: '서버 에러' },
      },
    },
  })
  async getDocsViews() {
    try {
      const result = await this.adminService.getDocsViews();
      return {
        success: true,
        data: result,
        message: '성공적으로 문서 조회수 순위를 가져왔습니다.',
      };
    } catch (error) {
      throw error;
    }
  }
}
