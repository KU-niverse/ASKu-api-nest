import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepository } from 'typeorm';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { QuestionLike } from './entities/questionLike.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}
  async getQuestionsByUserId(userId: number): Promise<Question[]> {
    const qusetions: Question[] = await this.questionRepository.find({
      where: { userId },
      relations: ['user', 'wikiDoc'],
    });
    if (qusetions.length === 0) {
      throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다');
    }
    return qusetions;
  }

  // TODO : "like_count" & "answer_count" 구현

  // async getQuestionOne(id: number): Promise<Question> {
  //   const result = await this.questionRepository
  //     .createQueryBuilder('question')
  //     .leftJoinAndSelect('question.user', 'user')
  //     .leftJoinAndSelect('user.repBadge', 'badge')
  //     .leftJoinAndMapOne(
  //       'question.likeCount',
  //       (subQuery) => {
  //         return subQuery
  //           .from(QuestionLike, 'question_like')
  //           .select('COUNT(*)', 'count')
  //           .where('question_like.id = :id', { id })
  //           .groupBy('question_like.id');
  //       },
  //       'question_like',
  //       'question.id = question_like.id',
  //     )
  //     .leftJoinAndMapOne(
  //       'question.answerCount',
  //       (subQuery) => {
  //         return subQuery
  //           .from(Answer, 'answer')
  //           .select('COUNT(*)', 'count')
  //           .where('answer.questionId = :id', { id })
  //           .groupBy('answer.questionId');
  //       },
  //       'answer',
  //       'question.id = answer.questionId',
  //     )
  //     .where('question.id = :id', { id })
  //     .select([
  //       'question',
  //       'user.nickname',
  //       'badge.image',
  //       'question_like.count',
  //       'answer.count',
  //     ])
  //     .getOne();
  //   if (!result) {
  //     throw new NotFoundException('해당 ID의 질문이 존재하지 않습니다.');
  //   }
  //   return result;
  // }

  async getQuestionById(id: number): Promise<Question> {
    const result = await this.questionRepository.findOne({
      where: { id },
      relations: ['user', 'user.repBadge'],
    });
    if (!result) {
      throw new NotFoundException('해당 ID의 질문이 존재하지 않습니다.');
    }
    return result;
  }
}
