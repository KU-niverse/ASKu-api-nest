import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    // success키 값이 존재한다면 그대로 return
    if (exceptionResponse['success']) {
      return response.status(status).json(exceptionResponse);
    }
    // success키 값이 존재하지 않는다면 success: false를 추가하여 return
    return response.status(status).json({
      success: false, // 모든 예외에 success: false 추가
      statusCode: status,
      message: exceptionResponse['message'] || 'An error occurred',
    });
  }
}
