import {
  BadRequestException,
  Injectable,
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

  async getAllDebateByEdit(): Promise<Debate[]> {
    const debate: Debate[] = await this.debate
      .createQueryBuilder('debate')
      .innerJoinAndSelect('debate.wikiDoc', 'wikiDoc')
      .select(['debate', 'wikiDoc.title'])
      .orderBy('debate.recentEditedAt', 'DESC')
      .getMany();

    return debate;
  }

  async getDebateListBySubject(subject: string): Promise<Debate[]> {
    // TODO: 위키 모듈의 서비스 함수로 분리
    const wikidoc: WikiDoc = await this.wikiDoc.findOne({
      where: { title: subject },
    });
    // TODO: 한번에 조회로 묶을 수도?
    const debate: Debate[] = await this.debate.find({
      where: { wikiDoc: { id: wikidoc.id } },
      order: { createdAt: 'DESC' },
    });
    return debate;
  }

  async getDebateListByQuery(title: string, query: string): Promise<Debate[]> {
    const regex = /[\{\}\[\]?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/g; // eslint-disable-line
    // TODO: 로직 설명 추가 요함
    const query_result = query.trim().replace(regex, '');

    if (!query_result) {
      throw new BadRequestException('잘못된 검색어입니다.');
    }
    const decoded_query: string = decodeURIComponent(query_result);
    const decoded_title: string = decodeURIComponent(title);
    const wikiDoc = await this.wikiDoc.findOne({
      where: { title: decoded_title },
    });

    let debates: Debate[] = await this.debate.find({
      where: {
        wikiDoc: { id: wikiDoc.id },
        subject: Like(`%${decoded_query}%`),
      },
      order: { createdAt: 'DESC' },
    });

    debates = debates.map((debate) => {
      delete debate.wikiDoc;
      return debate;
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

  async endDebate(id: string): Promise<void> {
    const [flag] = await this.debateRepository.query(
      `SELECT done_or_not AS "doneOrNot" FROM debates WHERE id = ?`,
      [id],
    );
  
    if (!flag || flag.doneOrNot) {
      throw new Error('이미 종료된 토론방입니다.'); 
    } else {
      const date = new Date();
      date.setHours(date.getHours() + 9);
      await this.debateRepository.query(
        `UPDATE debates SET done_or_not = true, done_at = ? WHERE id = ?`,
        [date.toISOString().slice(0, 19).replace('T', ' '), id],
      );
    }
  }

  //정상
  async getIdByTitle(title: string): Promise<number> {
    const wikiDoc = await this.wikiDoc.findOne({
      where: { title },
      select: ['id'],
    });
    const docId = wikiDoc?.id;
    return docId;
  }

  async createDebateNewTitle(
    newDebate: Partial<Debate>,
  ): Promise<Omit<Debate, 'wikiDoc'>> {
    const result = await this.debate.save(newDebate);
    return this.getDebateWithoutWikiDoc(result.id);
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

  async getAllDebateHistoryByDebateId(debateId: number): Promise<DebateHistory[]> {
    const result = await this.debateRepository
      .createQueryBuilder('debateHistory')
      .innerJoinAndSelect('debateHistory.user', 'user')
      .innerJoinAndSelect('user.badge', 'badge')
      .where('debateHistory.debateId = :debateId', { debateId })
      .orderBy('debateHistory.createdAt')
      .getMany();
  
    return result;
  }
}
