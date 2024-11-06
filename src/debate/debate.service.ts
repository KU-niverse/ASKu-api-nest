import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable, InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { DebateHistory } from './entities/debateHistory.entity';
import { Debate } from './entities/debate.entity';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';

@Injectable()
export class DebateService {
  constructor(
    @InjectRepository(DebateHistory)
    private debateRepository: Repository<DebateHistory>,
    @InjectRepository(Debate)
    private debate: Repository<Debate>,
    @InjectRepository(WikiDoc)
    private wikiDoc: Repository<WikiDoc>,
  ) {}

  async getMyDebateHistory(userId: number): Promise<DebateHistory[]> {
    const result: DebateHistory[] = await this.debateRepository.find({
      where: { userId },
      relations: ['debate'],
    });
    return result;
  }

  async getAllDebateByEdit(): Promise<any> {
    try {
      const debates = await this.debate
        .createQueryBuilder('debate')
        .innerJoinAndSelect('debate.wikiDoc', 'wikiDoc')
        .select([
          'debate.id as id',
          'debate.docId as doc_id',
          'debate.userId as user_id',
          'debate.subject as subject',
          'debate.createdAt as created_at',
          'debate.recentEditedAt as recent_edited_at',
          'debate.doneOrNot as done_or_not',
          'debate.doneAt as done_at',
          'debate.isBad as is_bad',
          'wikiDoc.title as title',
        ])
        .orderBy('debate.recentEditedAt', 'DESC')
        .getRawMany();

      // Transform boolean values to numbers (0 or 1)
      const transformedDebates = debates.map((debate) => ({
        ...debate,
        done_or_not: debate.done_or_not ? 1 : 0,
        is_bad: debate.is_bad ? 1 : 0,
      }));

      return {
        success: true,
        message: '전체 최신 수정순 토론방 목록을 조회하였습니다.',
        data: transformedDebates,
      };
    } catch (error) {
      throw new InternalServerErrorException({
        success: false,
        message: '오류가 발생하였습니다.',
      });
    }
  }

  async getDebateListByTitle(title: string): Promise<Debate[]> {
    const wikiDoc = await this.wikiDoc.findOne({
      where: { title },
    });

    if (!wikiDoc) {
      throw new BadRequestException('존재하지 않는 문서입니다.');
    }

    const debates = await this.debate.find({
      where: { wikiDoc: { id: wikiDoc.id } },
      relations: ['wikiDoc'],
      order: { createdAt: 'DESC' },
    });

    return debates;
  }

  async getDebateListByQuery(title: string, query: string): Promise<Debate[]> {
    const regex = /[\{\}\[\]?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g; // eslint-disable-line
    const query_result = query.trim().replace(regex, '');

    if (!query_result) {
      throw new BadRequestException('잘못된 검색어입니다.');
    }

    const decoded_query: string = decodeURIComponent(query_result);
    const decoded_title: string = decodeURIComponent(title);
    const wikiDoc = await this.wikiDoc.findOne({
      where: { title: decoded_title },
    });

    if (!wikiDoc) {
      throw new BadRequestException('문서를 찾을 수 없습니다.');
    }

    const debates = await this.debate.find({
      where: {
        wikiDoc: { id: wikiDoc.id },
        subject: Like(`%${decoded_query}%`),
      },
      order: { createdAt: 'DESC' },
    });

    return debates;
  }

  async getSearchAllDebateByQuery(query: string): Promise<Debate[]> {
    const regex = /[\{\}\[\]?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g; // eslint-disable-line
    const query_result = query.trim().replace(regex, '');

    if (!query_result) {
      throw new BadRequestException('잘못된 검색어입니다.');
    }

    const decodedQuery = decodeURIComponent(query_result);
    const debate: Debate[] = await this.debate.find({
      where: { subject: Like(`%${decodedQuery}%`) },
      order: { createdAt: 'DESC' },
      relations: ['wikiDoc'],
    });

    return debate;
  }

  async endDebate(id: string): Promise<any> {
    try {
      const [flag] = await this.debateRepository.query(
        `SELECT done_or_not AS "doneOrNot" FROM debates WHERE id = ?`,
        [id],
      );

      if (!flag || flag.doneOrNot) {
        throw new HttpException(
          {
            success: false,
            message: '이미 종료된 토론방입니다.',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const date = new Date();
      date.setHours(date.getHours() + 9);
      await this.debateRepository.query(
        `UPDATE debates SET done_or_not = true, done_at = ? WHERE id = ?`,
        [date.toISOString().slice(0, 19).replace('T', ' '), id],
      );

      return {
        success: true,
        message: '토론방을 종료하였습니다.',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // 이미 생성된 HttpException은 그대로 전달
      }
      throw new HttpException(
        {
          success: false,
          message: '오류가 발생하였습니다.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //정상
  async getIdByTitle(title: string): Promise<number> {
    const wikiDoc = await this.wikiDoc.findOne({
      where: { title },
      select: ['id'],
    });

    if (!wikiDoc) {
      throw new BadRequestException('존재하지 않는 문서입니다.');
    }

    return wikiDoc.id;
  }

  async createDebateNewTitle(newDebate: Partial<Debate>): Promise<Debate> {
    return await this.debate.save(newDebate);
  }

  async getDebateWithoutWikiDoc(id: number): Promise<Omit<Debate, 'wikiDoc'>> {
    const debate = await this.debate.findOne({
      where: { id },
      relations: ['wikiDoc'],
    });
    if (!debate) {
      throw new NotFoundException('토론을 찾을 수 없습니다.');
    }
    const { wikiDoc, ...debateWithoutWikiDoc } = debate;
    return debateWithoutWikiDoc as Omit<Debate, 'wikiDoc'>;
  }

  // TODO: api 정상 작동 확인 후 삭제 요망
  async getDebate(id: number): Promise<Debate> {
    const debate = await this.debate.findOne({
      where: { id },
      relations: ['wikiDoc'],
    });
    if (!debate) {
      throw new NotFoundException('토론을 찾을 수 없습니다.');
    }
    return debate;
  }

  async getAllDebateHistoryByDebateId(
    debateId: number,
  ): Promise<DebateHistory[]> {
    const result = await this.debateRepository
      .createQueryBuilder('debateHistory')
      .innerJoinAndSelect('debateHistory.user', 'user')
      .innerJoinAndSelect('user.badge', 'badge')
      .where('debateHistory.debateId = :debateId', { debateId })
      .orderBy('debateHistory.createdAt')
      .getMany();

    if (!result || result.length === 0) {
      throw new HttpException(
        {
          success: false,
          message: '토론 메시지를 찾을 수 없습니다.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }
}
