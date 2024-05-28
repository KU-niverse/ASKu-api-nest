import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WikiHistory } from './entities/wikiHistory.entity';
import { Repository } from 'typeorm';
import { WikiDoc } from './entities/wikiDoc.entity';

@Injectable()
export class WikiService {
  constructor(
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
    @InjectRepository(WikiDoc)
    private wikiDocRepository: Repository<WikiDoc>,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    const wikiHistory: WikiHistory[] = await this.wikiHistoryRepository.find({
      where: { userId: userId },
      relations: ['wikiDoc'],
    });
    return wikiHistory;
  }

  async getAllWikiDocs(): Promise<string[]> {
    const allWikiDocs: WikiDoc[] = await this.wikiDocRepository.find({
      where: { isDeleted: false },
      select: ['title'],
    });
    return allWikiDocs.map((doc) => doc.title);
  }

  async getRandomWikiDoc(): Promise<{ [key: string]: string | boolean }> {
    const randomWikiDoc: WikiDoc = await this.wikiDocRepository
      .createQueryBuilder('wikiDoc')
      .select('wikiDoc.title')
      .where('wikiDoc.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('RAND()')
      .limit(1)
      .getOne();
    return {
      '0': randomWikiDoc ? randomWikiDoc.title : 'No Document Found',
      success: true,
    };
  }

  async getWikiDocsIdByTitle(title: string): Promise<number> {
    const wikiDoc = await this.wikiDocRepository.findOne({ where: { title } });

    if (!wikiDoc) {
      throw new NotFoundException('Document not found');
    }

    return wikiDoc.id;
  }

  async deleteWikiDocsById(id: number): Promise<void> {
    const result = await this.wikiDocRepository.update(id, { isDeleted: true });

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete document');
    }
  }
}
