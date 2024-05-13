import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepository } from 'typeorm';
import { Question } from './entities/question.entity';
import { QuestionArrange } from 'src/question/enums/questeionArrange.enum';
import { Answer } from './entities/answer.entity';
import { QuestionLike } from './entities/questionLike.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}
  async getQuestionsByUserId(
    userId: number,
    arrange: QuestionArrange,
  ): Promise<Question[]> {
    //TODO: arrange 반영하여 쿼리 수정 필요
    const qusetions: Question[] = await this.questionRepository.find({
      where: { userId },
      relations: ['user', 'wikiDoc'],
    });
    if (qusetions.length === 0) {
      throw new NotFoundException('해당 ID를 가진 유저가 존재하지 않습니다');
    }
    return qusetions;
  }

  // TODO TYPORM 으로 변경 가능여부 재고
  async getQuestionById(id: number): Promise<Question> {
    const result = await this.questionRepository.query(
      `SELECT q.*, users.nickname, badges.image AS badge_image, COALESCE(ql.like_count, 0) AS like_count, COALESCE(a.answer_count, 0) AS answer_count
      FROM questions q
      INNER JOIN users ON q.user_id = users.id
      INNER JOIN badges ON users.rep_badge = badges.id
      LEFT JOIN (
          SELECT id, COUNT(*) as like_count 
          FROM question_like 
          GROUP BY id
      ) ql ON q.id = ql.id
      LEFT JOIN (
          SELECT question_id, COUNT(*) as answer_count 
          FROM answers 
          GROUP BY question_id
      ) a ON q.id = a.question_id
      WHERE q.id = ${id};`,
    );
    if (!result) {
      throw new NotFoundException('해당 ID의 질문이 존재하지 않습니다.');
    }
    return result;
  }

  // async getQuestionById(id: number): Promise<Question> {
  //   const result = await this.questionRepository.findOne({
  //     where: { id },
  //     relations: ['user', 'user.repBadge'],
  //   });
  //   if (!result) {
  //     throw new NotFoundException('해당 ID의 질문이 존재하지 않습니다.');
  //   }
  //   return result;
  // }
}
