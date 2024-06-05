import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
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
  questionLikeRepository: any;
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
    return result;
  }

  // 인기순 정렬
  async getQuestionByTitle(title: string, flag: string): Promise<Question[]> {
    const id = await this.getDocumentIdByTitle(title);

    const order = this.getOrderBy(flag);
    let questions: Question[];
    if (flag === '1') {
      questions = await this.questionRepository.query(
        `SELECT q.*, users.nickname, COALESCE(ql.like_count, 0) AS like_count, COALESCE(a.answer_count, 0) AS answer_count
      FROM questions q
      INNER JOIN users ON q.user_id = users.id
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
      WHERE q.doc_id = ${id}
      ORDER BY like_count DESC, q.created_at DESC`,
      );
    }
    if (flag === '0') {
      questions = await this.questionRepository.query(
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
      WHERE q.doc_id = ${id}
      ORDER BY q.created_at DESC`,
      );
    }

    return questions;
  }

  private getOrderBy(flag: string): { [key: string]: 'ASC' | 'DESC' } {
    switch (flag) {
      case '1':
        return { like_count: 'DESC' }; // 인기순 정렬
      case '0':
        return { createdAt: 'DESC' }; // 최신순 정렬
      default:
        throw new NotFoundException('잘못된 flag 값입니다.');
    }
  }
  async getDocumentIdByTitle(title: string): Promise<number> {
    const document = await this.wikiDocRepository.findOne({
      select: ['id'], // 오직 id 필드만 선택
      where: { title: title },
    });

    if (!document) {
      throw new NotFoundException(`Document with title '${title}' not found.`);
    }

    return document.id; // 문서 ID 반환
  }

  // QuestionId로 Answer 가져오기
  async getAnswerByQuestionId(questionId: number): Promise<Answer[]> {
    const answers = await this.answerRepository.query(
      `SELECT answers.*, wiki_history.user_id, wiki_history.version, wiki_history.index_title,
      users.nickname, users.rep_badge, wiki_docs.title,
      badges.image AS badge_image
      FROM wiki_history
      INNER JOIN answers ON wiki_history.id = answers.wiki_history_id
      INNER JOIN users ON wiki_history.user_id = users.id
      INNER JOIN badges ON users.rep_badge = badges.id
      INNER JOIN wiki_docs on wiki_history.doc_id = wiki_docs.id
      WHERE answers.question_id = ?
      ORDER BY answers.created_at ASC;`,
      [questionId],
    );
    if (!answers.length) {
      throw new NotFoundException('해당 ID를 가진 답변이 존재하지 않습니다');
    }
    return answers;
  }

  // 쿼리 문자열을 포함하는 질문들을 데이터베이스에서 검색
  async getQuestionsByQuery(query: string): Promise<Question[]> {
    // TODO: full-text search 적용하는 쿼리로 수정
    const rawQuery = `SELECT q.*, users.nickname, COALESCE(ql.like_count, 0) AS like_count, COALESCE(a.answer_count, 0) AS answer_count, wiki_docs.title
    FROM questions q
    INNER JOIN users ON q.user_id = users.id
    INNER JOIN wiki_docs ON q.doc_id = wiki_docs.id
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
      WHERE q.content LIKE ?
      ORDER BY q.created_at DESC
    `;

    try {
      const questions = await this.questionRepository.query(rawQuery, [
        `%${query}%`,
      ]);

      // 반환된 결과가 배열이 아닌 경우 처리
      if (!Array.isArray(questions)) {
        return [questions];
      }

      return questions;
    } catch (error) {
      console.error('Error occurred while searching for questions:', error);
      throw error;
    }
  }
  async getPopularQuestion(): Promise<Question[]> {
    const rows = await this.questionRepository.query(
      `SELECT q.*, COALESCE(ql.like_count, 0) AS like_count, COALESCE(a.answer_count, 0) AS answer_count, wd.title, users.nickname
      FROM questions q
      INNER JOIN wiki_docs wd ON q.doc_id = wd.id
      INNER JOIN users ON users.id = q.user_id
      LEFT JOIN (
          SELECT id, COUNT(*) AS like_count 
          FROM question_like 
          GROUP BY id
      ) ql ON q.id = ql.id
      LEFT JOIN (
          SELECT question_id, COUNT(*) as answer_count 
          FROM answers 
          GROUP BY question_id
      ) a ON q.id = a.question_id  
      WHERE q.answer_or_not = 0
      GROUP BY q.id
      ORDER BY like_count DESC
      LIMIT 5;`,
    );
    if (!rows.length) {
      throw new NotFoundException('No popular questions found');
    }
    return rows;
  }

  async updateQuestion(
    questionId: number,
    userId: number,
    editQuestionDto: EditQuestionDto,
  ): Promise<boolean> {
    const { new_content } = editQuestionDto;

    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    // 답변이 이미 달린 질문이거나, 질문 작성자가 아닌 경우 수정 불가
    if (question && !question.answerOrNot && question.userId === userId) {
      question.content = new_content;
      await this.questionRepository.save(question);
      return true;
    }
  }

  async deleteQuestion(questionId: number, userId: number): Promise<boolean> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    // 답변이 이미 달린 질문이거나, 질문 작성자가 아닌 경우 삭제 불가
    if (question && !question.answerOrNot && question.userId === userId) {
      await this.questionRepository.remove(question);
      return true;
    } else {
      return false;
    }
  }

  async getIdByTitle(title: string): Promise<number> {
    const document = await this.wikiDocRepository.findOne({
      select: ['id'], // 오직 id 필드만 선택
      where: { title },
    });

    if (!document) {
      // 문서가 없으면 새로운 문서 생성
      const newDocument = this.wikiDocRepository.create({ title });
      const savedDocument = await this.wikiDocRepository.save(newDocument);
      return savedDocument.id;
    }

    return document.id; // 문서 ID 반환
  }

  async createQuestion(
    createQuestionDto: CreateQuestionDto,
    userId: number,
  ): Promise<{
    data: Question;
    message: string;
    body: { user_id: number; types_and_conditions: number[][] };
  }> {
    const { content, index_title, title } = createQuestionDto;

    if (!content) {
      throw new BadRequestException('내용을 작성해주세요.');
    }

    const doc_id = await this.getIdByTitle(title);

    const newQuestion = this.questionRepository.create({
      content,
      user: { id: userId } as any, // 관계 설정을 위해 user를 객체로 생성
    });

    try {
      const result = await this.questionRepository.save(newQuestion);
      const savedQuestion = await this.getQuestionById(result.id);

      return {
        data: savedQuestion,
        message: '질문을 등록하였습니다.',
        body: {
          user_id: userId,
          types_and_conditions: [[1, doc_id]],
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        '질문 생성 중 오류가 발생하였습니다.',
      );
    }
  }

  async likeQuestion(questionId: number, userId: number): Promise<number> {
    try {
      const question = await this.questionRepository.findOne({
        where: { id: questionId },
      });
      console.log(question);
      if (!question) {
        console.log('오류?');
        throw new NotFoundException('질문을 찾을 수 없습니다.');
      }

      if (question.userId === userId) {
        return -1; // 본인의 질문에 좋아요를 누를 수 없음
      }

      const like = await this.questionLikeRepository.findOne({
        where: { questionId, userId },
      });

      console.log(like);
      if (like) {
        return 0; // 이미 좋아요를 누름
      }

      const newLike = this.questionLikeRepository.create({
        questionId,
        userId,
      });

      await this.questionLikeRepository.save(newLike);

      return 1; // 좋아요 성공
    } catch (error) {
      throw new InternalServerErrorException('오류가 발생하였습니다.');
    }
  }
}
