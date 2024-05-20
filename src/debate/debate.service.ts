import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebateHistory } from './entities/debateHistory.entity';
import { Debate } from './entities/debate.entity';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';

@Injectable()
export class DebateService {
  constructor(
    @InjectRepository(DebateHistory)
    private debateRepository: Repository<DebateHistory>,
    @InjectRepository(Debate)
    private debate: Repository<Debate>,
    @InjectRepository(WikiDoc)
    private wikiDoc: Repository<WikiDoc>,
  ) {}

  async getMyDebateHistory(userId: number): Promise<DebateHistory[]> {
    const result: DebateHistory[] = await this.debateRepository.find({
      where: { userId },
      relations: ['debate'],
    });
    return result;
  }

  async getAllDebateByEdit(): Promise<Debate[]> {
    const debate: Debate[] = await this.debate
      .createQueryBuilder('debate')
      .innerJoinAndSelect('debate.wikiDoc', 'wikiDoc')
      .select(['debate', 'wikiDoc.title'])
      .orderBy('debate.recentEditedAt', 'DESC')
      .getMany();

    return debate;
  }

  async getDebateListBySubject(subject: string): Promise<Debate[]> {
    // TODO: 위키 모듈의 서비스 함수로 분리
    const wikidoc: WikiDoc = await this.wikiDoc.findOne({
      where: { title: subject },
    });
    // TODO: 한번에 조회로 묶을 수도?
    const debate: Debate[] = await this.debate.find({
      where: { wikiDoc: { id: wikidoc.id } },
      order: { createdAt: 'DESC' },
    });
    return debate;
  }
}
