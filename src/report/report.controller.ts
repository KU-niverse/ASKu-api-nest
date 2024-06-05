import { Body, Controller, Post, Req, Res, UseGuards, Param, InternalServerErrorException, UnauthorizedException, HttpCode, HttpStatus, ValidationPipe } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ReportService } from "./report.service";
import { AuthGuard } from "@nestjs/passport";
import { Report } from "./entities/report.entity";
import { GetUser } from "src/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";
import { CreateReportDto } from "./dto/create-report.dto";

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}
    @Post('/:type')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: '신고를 생성하였습니다.',
        description: '신고 완료',
    })
    @ApiResponse({
        status: 200,
        description: '신고 완료',
        type: Report,
    })
    @ApiResponse({
        status: 500,
        description: '오류가 발생했습니다.',
    })
    @UseGuards(AuthGuard())
    async reportPostMid(
        @Param('type') typeId: number,
        @Body(ValidationPipe) createReportDto: CreateReportDto,
        @GetUser() user: User,
    ) {
        const newReport = new Report();
        newReport.userId = user.id;
        newReport.typeId = typeId;
        newReport.target = createReportDto.target;
        newReport.reasonId = createReportDto.reason_id ?? 1;
        newReport.comment = createReportDto.comment;
    
        const result = await this.reportService.createReport(newReport);
        return { data: [result] };
    }
}