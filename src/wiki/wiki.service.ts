import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { WikiHistory } from './entities/wikiHistory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(WikiHistory)
    private wikiRepository: Repository<WikiHistory>,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory> {
    const result = await this.wikiRepository.findOne({ where: { userId } });
    if (!result) {
      throw new NotFoundException(
        '해당 유저가 작성한 위키가 존재하지 않습니다.',
      );
    }
    return result;
  }
}
