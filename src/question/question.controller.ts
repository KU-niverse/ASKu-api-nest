import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { Question } from './entities/question.entity';


@Controller('question')
export class QuestionController {
    constructor(private readonly questionService:QuestionService) {}
    @Get('me/history/:userId')

    @ApiOperation({summary: '유저 배지 히스토리', description: '유저 배지 히스토리를 조회합니다.'})
    @ApiResponse({
        status: 201,
        description: '유저 배지 히스토리 조회를 성공했습니다.',
        type: QuestionService,
    })
    @ApiResponse({
        status: 404,
        description: '해당 ID를 가진 유저가 없습니다.',
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 접근입니다. 배지 히스토리 불러오기에 실패하였습니다.',
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

    getMeQuestionHistory(@Param('userId') userId: number): Promise<Question[]> {
        return this.questionService.getMyQuestionHistory(userId);
    }
}