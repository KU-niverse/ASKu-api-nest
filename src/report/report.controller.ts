import {
  Body,
  Controller,
  Post,
  UseGuards,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Put,
  Request
} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ReportService } from "./report.service";
import { AuthGuard } from "@nestjs/passport";
import { Report } from "./entities/report.entity";
import { GetUser } from "src/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";
import { CreateReportDto } from "./dto/create-report.dto";

@ApiTags('report')
@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}
    @Post('/:type')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard())
    @ApiOperation({
        summary: '신고 생성',
        description: '신고 완료',
    })
    @ApiResponse({
        status: 200,
        description: '신고 완료',
        type: Report,
    })
    @ApiResponse({
      status: 401,
      description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
    })
    @ApiResponse({
        status: 500,
        description: '오류가 발생했습니다.',
    })
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

    @Put('/check')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard())
    @ApiOperation({
      summary: '신고 확인하기',
      description: '신고 확인 처리',
    })
    @ApiResponse({
      status: 200,
      description: '신고를 확인했습니다.',
    })
    @ApiResponse({
      status: 400,
      description: '이미 확인한 신고입니다.',
    })
    @ApiResponse({
      status: 401,
      description: '인증되지 않은 사용자입니다. 로그인이 필요합니다.',
    })
    @ApiResponse({
      status: 406,
      description: '잘못된 확인값입니다.',
    })
    @ApiResponse({
      status: 500,
      description: '오류가 발생했습니다.',
    })
    async checkReport(
    @Body('id') id: number,
    @Body('is_checked') isChecked: number,
    @Request() req,
    ) {
        const user = req.user; 
        return this.reportService.handleCheckReport(id, isChecked, user);
    }
}