import { Injectable } from '@nestjs/common';
import { WikiRepository } from './wiki.repository';
import { ContributionsResponseDto } from './dto/contributions-response.dto';
import { WikiHistory } from './entities/wikiHistory.entity';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class WikiService {
  constructor(
    private wikiRepository: WikiRepository,
    private userRepository: UserRepository,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    return this.wikiRepository.getWikiHistoryByUserId(userId);
  }

  async getUserContributions(
    userId: number,
  ): Promise<ContributionsResponseDto> {
    // 전체 유저 수 조회
    const totalUsers = await this.userRepository.getTotalUsers();

    // 유저 랭킹 및 포인트 조회
    const userRankingAndPoint =
      await this.userRepository.getUserRankingAndPoint(userId);

    const { ranking, user_point } = userRankingAndPoint;

    // 랭킹 퍼센티지 계산
    let ranking_percentage = (ranking / totalUsers) * 100;
    if (user_point === 0) {
      ranking_percentage = 100;
    }

    // 문서별 기여도 조회
    const docsContributions = await this.wikiRepository.getDocsContributions(
      userId,
      user_point,
    );

    return {
      count: totalUsers,
      ranking,
      point: user_point,
      ranking_percentage: Number(ranking_percentage.toFixed(4)),
      docs: docsContributions.map((doc) => ({
        ...doc,
        doc_point: doc.doc_point.toString(),
        percentage: doc.percentage.toString(),
      })),
    };
  }
}
