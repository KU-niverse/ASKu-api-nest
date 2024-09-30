import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { WikiService } from '../../wiki/wiki.service';

@Injectable()
export class WikiPointAwardMiddleware implements NestMiddleware {
  constructor(private readonly wikiService: WikiService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user['id']; // 사용자 ID를 요청 객체에서 가져옵니다.
      const diff = req.body.diff; // 변경된 내용의 크기
      const isQBased = req.body.isQBased; // 질문 기반 여부

      await this.wikiService.awardWikiPoint(userId, diff, isQBased);

      next();
    } catch (error) {
      console.error('Wiki point award error:', error);
      next(error); // 에러를 다음 미들웨어나 글로벌 에러 핸들러로 전달
    }
  }
}