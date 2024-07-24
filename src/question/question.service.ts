import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { User } from 'src/user/entities/user.entity';
import { Badge } from 'src/badge/entities/badge.entity';
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';
import { EditQuestionDto } from 'src/question/dto/edit-question.dto';
import { Answer } from './entities/answer.entity';
import { QuestionLike } from './entities/questionLike.entity';
import { Pool } from 'mysql2/typings/mysql/lib/Pool';
import { Action } from 'rxjs/internal/scheduler/Action';
import { CreateQuestionDto } from 'src/question/dto/create-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WikiDoc)
    private wikiDocRepository: Repository<WikiDoc>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(User)
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(WikiHistory)
    private readonly wikiHistoryRepository: Repository<WikiHistory>,
    @InjectRepository(QuestionLike)
    private readonly questionLikeRepository: Repository<QuestionLike>,
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

  // 질문 ID로 질문, 작성자의 닉네임과 뱃지 이미지, 질문에 대한 좋아요 수와 답변 수를 출력하는 SQL문 입니다.
  async getQuestionById(id: number): Promise<Question> {
    const result: Question[] = await this.questionRepository.query(
      // `SELECT q.*, users.nickname, badges.image AS badge_image, COALESCE(ql.like_count, 0) AS like_count, COALESCE(a.answer_count, 0) AS answer_count
      // FROM questions q
      // INNER JOIN users ON q.user_id = users.id
      // INNER JOIN badges ON users.rep_badge = badges.id
      // LEFT JOIN (
      //     SELECT id, COUNT(*) as like_count
      //     FROM question_like
      //     GROUP BY id
      // ) ql ON q.id = ql.id
      // LEFT JOIN (
      //     SELECT question_id, COUNT(*) as answer_count
      //     FROM answers
      //     GROUP BY question_id
      // ) a ON q.id = a.question_id
      // WHERE q.id = ${id};`,
      `SELECT * FROM questions WHERE id = ?`,
      [id],
    );
    return result[0];
  }

  async deleteQuestion(questionId: number, userId: number): Promise<number> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    const questionLike = await this.questionLikeRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      return -1;
    }

    if (!question.answerOrNot && question.userId === userId) {
      if (questionLike) {
        await this.questionLikeRepository.remove(questionLike);
      }
      await this.questionRepository.remove(question);
      return 1;
    } else {
      return 0;
    }
  }
}
