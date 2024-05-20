import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { QuestionArrange } from 'src/question/enums/questeionArrange.enum';
import { Answer } from './entities/answer.entity';
import { QuestionLike } from './entities/questionLike.entity';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(WikiDoc)
    private wikiDocRepository: Repository<WikiDoc>,

  ) {}

  //TODO: 이 api 기존 api와 달라짐

  async getQuestionsByUserId(userId: number, flag: number) {
    const queryBuilder = this.questionRepository
      .createQueryBuilder('q')
      .innerJoinAndSelect('q.user', 'user')
      .leftJoinAndSelect('user.badge', 'badge')
      .innerJoinAndSelect('q.wikiDoc', 'wikiDoc')
      .leftJoin('q.likes', 'likes')
      .leftJoin('q.answers', 'answers')
      .select([
        'q.id AS id',
        'q.docId AS doc_id',
        'q.userId AS user_id',
        'q.indexTitle AS index_title',
        'q.content AS content',
        'q.createdAt AS created_at',
        'answer_or_not',
        'is_bad',
        'nickname',
        'user.repBadge AS rep_badge',
        'badge.image',
        'wikiDoc.title AS doc_title',
        'COUNT(DISTINCT likes.id) AS like_count',
        'COUNT(DISTINCT answers.id) AS answer_count',
      ])
      .where('q.userId = :userId', { userId })
      .groupBy('q.id')
      .addGroupBy('user.id')
      .addGroupBy('badge.id')
      .addGroupBy('wikiDoc.id');
    // 정렬 제대로 안 되는 중
    if (flag === 0) {
      queryBuilder.orderBy('STR_TO_DATE(q.createdAt, \'%Y-%m-%d %H:%i:%s.%f\')', 'DESC');
    } else if (flag === 1) {
      queryBuilder.orderBy('like_count', 'DESC').addOrderBy('STR_TO_DATE(q.createdAt, \'%Y-%m-%d %H:%i:%s.%f\')', 'DESC');
    }
    
    return queryBuilder.getRawMany();
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

  // 인기순 정렬 시도
  async getQuestionByTitle(
    // id: number,
    title: string,
    flag: string,
  ): Promise<Question[]> {
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
}
