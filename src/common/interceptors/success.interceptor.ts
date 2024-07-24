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
        if (data?.success) {
          return data;
        }

        if (statusCode >= 200 && statusCode < 300) {
          if (data == undefined) {
            return {
              success: true,
            };
          }
          if (!isArray(data)) {
            return {
              success: true,
              data: data,
            };
          }
          return {
            success: true,
            data: [...data],
          };
        } else {
          if (!isArray(data)) {
            return {
              success: false,
              data: data,
            };
          }
          return {
            success: false,
            data: [...data],
          };
        }
      }),
    );
  }
}
