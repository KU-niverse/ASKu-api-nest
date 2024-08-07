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

  // TODO TYPORM 으로 변경 가능여부 재고
  // 질문 ID로 질문, 작성자의 닉네임과 뱃지 이미지, 질문에 대한 좋아요 수와 답변 수를 출력하는 SQL문 입니다.
  async getQuestionById1(id: number): Promise<Question> {
    const result: Question[] = await this.questionRepository.query(
      `SELECT * FROM questions WHERE id = ?`,
      [id],
    );
    return result[0];
  }

  async likeQuestion(questionId: number, userId: number): Promise<number> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (question == null) {
      return 2;
    }

    if (question.userId === userId) {
      return -1; // 본인의 질문에 좋아요를 누를 수 없음
    }

    const like = await this.questionLikeRepository.findOne({
      where: { id: questionId, userId },
    });

    if (like) {
      return 0; // 이미 좋아요를 누름
    }

    const newLike = this.questionLikeRepository.create({
      id: questionId,
      userId,
    });

    await this.questionLikeRepository.save(newLike);
    return 1; // 좋아요 성공
  }
}
