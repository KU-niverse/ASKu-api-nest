import { Body, Controller, Post, Req, Res, UseGuards, Param, InternalServerErrorException, UnauthorizedException, HttpCode, HttpStatus, ValidationPipe, Request, Put } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ReportService } from "./report.service";
import { AuthGuard } from "@nestjs/passport";
import { Report } from "./entities/report.entity";
import { GetUser } from "src/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";
import { CheckReportDto } from "./dto/create-report.dto";

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}
    @Put('/check')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '신고를 확인하였습니다.',
        description: '신고 확인 완료',
    })
    @ApiResponse({
        status: 200,
        description: '신고 확인 완료',
    })
    @ApiResponse({
        status: 400,
        description: '이미 확인한 신고입니다.',
    })
    @ApiResponse({
        status: 406,
        description: '잘못된 확인값입니다.',
    })
    @ApiResponse({
        status: 500,
        description: '오류가 발생하였습니다.',
    })
    @UseGuards(AuthGuard())
    async reportCheckPostMid(
        @Body(ValidationPipe) checkReportDto: CheckReportDto,
        @Request() req,
        @GetUser() user: User,
    ) {
        if (checkReportDto.isChecked !== 1) {
            throw new UnauthorizedException('잘못된 확인값입니다.');
        }

        const result = await this.reportService.checkReport(checkReportDto.reportId, checkReportDto.isChecked);
        if (result.changedRows) {
            const report = await this.reportService.getReport(checkReportDto.reportId);
            req.reportUser = report.userId;
            return { data: true };
        } else {
            throw new UnauthorizedException('이미 확인한 신고입니다.');
        }
    }
}