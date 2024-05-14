import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebateHistory } from './entities/debateHistory.entity';
import { Debate } from './entities/debate.entity';


@Injectable()
export class DebateService {
  constructor(
    @InjectRepository(DebateHistory)
    private debateRepository: Repository<DebateHistory>,
    @InjectRepository(Debate)
    private debate: Repository<Debate>,
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
      .select([
        'debate',
        'wikiDoc.title',
      ])
      .orderBy('debate.recentEditedAt', 'DESC')
      .getMany();

    return debate;
  }

  async getAllDebateByCreate(subject?: string): Promise<Debate[]> {
    const queryBuilder = this.debate
      .createQueryBuilder('debate')
      .innerJoinAndSelect('debate.wikiDoc', 'wikiDoc')
      .select(['debate'])
      .orderBy('debate.recentEditedAt', 'DESC');
  
    if (subject) {
      queryBuilder.andWhere('debate.subject LIKE :subject', { subject: `%${subject}%` });
    }
  
    const debate: Debate[] = await queryBuilder.getMany();
    return debate;
  }
}
