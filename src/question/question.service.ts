import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Question)
        private questionHistoryRepository: Repository<Question>,
    ) {}
    async getMyQuestionHistory(userId: number): Promise<Question[]> {
        const result =  await this.questionHistoryRepository.find({ where: { userId } });
        if(result.length === 0)
        {
            throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다')
        }
        return result;
    }
}