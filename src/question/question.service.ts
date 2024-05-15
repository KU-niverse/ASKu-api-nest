import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepository } from 'typeorm';
import { Question } from './entities/question.entity';
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

  // VIEW
  // TODO: 인기순 정렬 필요
  async getQuestionByTitle(title: string, flag: string): Promise<Question[]> {
    const order = this.getOrderBy(flag);
    const questions = await this.questionRepository.find({
      where: { wikiDoc: { title } },
      relations: ['user', 'wikiDoc', 'user.repBadge'],
      order: order,
    });

    if (questions.length === 0) {
      throw new NotFoundException('해당 제목을 가진 문서가 존재하지 않습니다.');
    }
    return questions;
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

  private getOrderBy(flag: string): { [key: string]: 'ASC' | 'DESC' } {
    switch (flag) {
      case '1':
        return { id: 'DESC' }; // 인기순 정렬
      case '0':
        return { createdAt: 'DESC' }; // 최신순 정렬
      default:
        throw new NotFoundException('잘못된 flag 값입니다.');
    }
  }

  // 인기순 정렬 시도
  // async getQuestionByTitle(
  //   // id: number,
  //   title: string,
  //   flag: string,
  // ): Promise<Question[]> {
  //   const id = await this.getDocumentIdByTitle(title);

  //   const order = this.getOrderBy(flag);
  //   const questions = await this.questionRepository.find({
  //     where: { wikiDoc: { title } },
  //     relations: ['user', 'wikiDoc', 'user.repBadge'],
  //     order: order,
  //   });

  //   if (questions.length === 0) {
  //     throw new NotFoundException('해당 제목을 가진 문서가 존재하지 않습니다.');
  //   }
  //   return questions;
  // }

  // private getOrderBy(flag: string): { [key: string]: 'ASC' | 'DESC' } {
  //   switch (flag) {
  //     case '1':
  //       return { id: 'DESC' }; // 인기순 정렬
  //     case '0':
  //       return { createdAt: 'DESC' }; // 최신순 정렬
  //     default:
  //       throw new NotFoundException('잘못된 flag 값입니다.');
  //   }
  // }

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
    // const questions = await this.questionRepository.query(
    //   `SELECT q.*, users.nickname, badges.image AS badge_image, COALESCE(ql.like_count, 0) AS like_count, COALESCE(a.answer_count, 0) AS answer_count
    //   FROM questions q
    //   INNER JOIN users ON q.user_id = users.id
    //   INNER JOIN badges ON users.rep_badge = badges.id
    //   LEFT JOIN (
    //       SELECT id, COUNT(*) as like_count
    //       FROM question_like
    //       GROUP BY id
    //   ) ql ON q.id = ql.id
    //   LEFT JOIN (
    //       SELECT question_id, COUNT(*) as answer_count
    //       FROM answers
    //       GROUP BY question_id
    //   ) a ON q.id = a.question_id
    //   WHERE q.doc_id = ${id}
    //   ORDER BY q.created_at DESC`,
    // );
    // const questions = await this.questionRepository.find({
    //   where: { wikiDoc: { title } },
    //   relations: ['user', 'wikiDoc', 'user.repBadge'],
    //   order: order,
    // });

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
    console.log('🚀 ~ QuestionService ~ getDocumentIdByTitle ~ title:', title);
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
