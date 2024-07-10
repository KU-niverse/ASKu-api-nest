import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode;

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
            data: [...data],
          };
        } else {
          return {
            success: false,
            data: [...data],
          };
        }
      }),
    );
  }
}
