import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
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
}
