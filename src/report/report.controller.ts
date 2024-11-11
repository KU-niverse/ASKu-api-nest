import { Body, Controller, Post, Req, Res, UseGuards, Param, InternalServerErrorException, UnauthorizedException, HttpCode, HttpStatus, ValidationPipe, Put, HttpException, Request } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ReportService } from "./report.service";
import { AuthGuard } from "@nestjs/passport";
import { Report } from "./entities/report.entity";
import { GetUser } from "src/auth/get-user.decorator";
import { User } from "src/user/entities/user.entity";
import { CreateReportDto } from "./dto/create-report.dto";
import { CheckReportDto } from "./dto/check-report.dto";

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
        const snakeResult = convertKeysToSnakeCase(result);

        return {success: true, data: snakeResult, message: '신고 완료'};
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
      status: 406,
      description: '잘못된 확인값입니다.',
    })
    @ApiResponse({
      status: 500,
      description: '오류가 발생했습니다.',
    })
    async checkReport(
      @Body(ValidationPipe) checkReportDto: CheckReportDto,
      @Request() req,
  ) {
      const user = req.user;
      return this.reportService.handleCheckReport(
          checkReportDto.report_id,
          checkReportDto.is_checked,
          user
      );
  }
}