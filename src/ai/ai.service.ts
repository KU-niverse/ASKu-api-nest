import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AiSession } from 'src/ai/entities/aiSession.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(AiSession)
    private aiSessionRepository: Repository<AiSession>,
  ) {}

  async createAiSession(userId: number): Promise<AiSession> {
    const aiSession = this.aiSessionRepository.create({
      userId,
    });
    await this.aiSessionRepository.save(aiSession);
    return aiSession;
  }
}
