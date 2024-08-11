import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { isArray } from 'class-validator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;
        if (!isArray(data) && data?.revised === 1) {
          return {
            success: data.success,
            message: data.message,
            data: data.data,
          };
        }
        if (data?.success) {
          return data;
        }

        if (statusCode >= 200 && statusCode < 300) {
          if (data == undefined) {
            return {
              success: true,
            };
          }
          if (typeof data == typeof []) {
            return {
              success: true,
              data,
            };
          }
          return {
            success: true,
            ...data,
          };
        } else {
          return {
            success: false,
            ...data,
          };
        }
      }),
    );
  }
}
