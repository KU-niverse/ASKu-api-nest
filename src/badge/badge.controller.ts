import { Controller, Get, Param } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Badge } from './entities/badge.entity';

@Controller('badge')
export class BadgeController {
    constructor(private readonly badgeService:BadgeService) {}
    @Get('all/:id')

    @ApiOperation({summary: '유저 배지', description: '유저 배지를 조회합니다.'})
    @ApiResponse({
        status: 201,
        description: '유저 배지 조회에 성공했습니다.',
        type: Badge,
    })
    @ApiResponse({
        status: 404,
        description: '해당 ID를 가진 유저가 없습니다.',
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 접근입니다. 배지 불러오기에 실패하였습니다.',
    })
    @ApiResponse({
        status: 401,
        description: '인증되지 않은 사용자입니다.',
    })
    @ApiResponse({
        status: 403,
        description: '권한이 없습니다.',
    })
    @ApiResponse({
        status: 500,
        description: '서버 에러',
    })

    getMeBadgeAll(@Param('id') id: number): Promise<Badge> {
        return this.badgeService.getMyBadgeAll(id);
    }
}
