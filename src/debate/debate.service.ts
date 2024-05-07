import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debate } from './entities/debate.entity';
@Injectable()
export class DebateService {
  constructor(
    @InjectRepository(Debate)
    private debateRepository: Repository<Debate>,
  ) {}

  async getAllDebateByEdit(): Promise<Debate[]> {
    const debate: Debate[] = await this.debateRepository
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
}
