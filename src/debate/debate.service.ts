import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebateHistory } from './entities/debateHistory.entity';

@Injectable()
export class DebateService {
  constructor(
    @InjectRepository(DebateHistory)
    private debateRepository: Repository<DebateHistory>,
  ) {}

  async getMyDebateHistory(id: number): Promise<DebateHistory> {
    const result = await this.debateRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다.');
    }
    return result;
  }
}
