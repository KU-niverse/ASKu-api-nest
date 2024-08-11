import {
  Injectable,
  PipeTransform,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class IsNotSignedInValidationPipe implements PipeTransform {
  transform(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['jwt']; // 'jwt'는 쿠키에 저장된 토큰의 키 이름입니다.

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // 적절한 시크릿 키를 사용하세요.
        if (decoded) {
          throw new UnauthorizedException('이미 로그인된 상태입니다.');
        }
      } catch (err) {
        // 토큰 검증 실패 (유효하지 않거나 만료된 토큰)
        return true; // 로그인되지 않았다고 가정하고 요청을 계속합니다.
      }
    }

    return true; // 토큰이 없는 경우, 로그인되지 않았다고 가정합니다.
  }
}
