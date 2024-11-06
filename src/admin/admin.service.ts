import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WikiDoc } from '../wiki/entities/wikiDoc.entity';
import { WikiDocsView } from '../wiki/entities/wikiView.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(WikiDoc)
    private readonly wikiDocRepository: Repository<WikiDoc>,
    @InjectRepository(WikiDocsView)
    private readonly wikiDocsViewRepository: Repository<WikiDocsView>,
  ) {}

  async getDocsViews() {
    try {
      return await this.wikiDocRepository
        .createQueryBuilder('A')
        .innerJoin(WikiDocsView, 'B', 'A.id = B.doc_id')
        .select([
          'A.id as id',
          'A.title as title',
          'A.textPointer as text_pointer',
          'A.latestVer as latest_ver',
          'A.type as type',
          'A.isDeleted as is_deleted',
          'A.recentFilteredContent as recent_filtered_content',
          'A.createdAt as created_at',
          'COUNT(*) as docs_views',
        ])
        .groupBy('B.doc_id')
        .orderBy('docs_views', 'DESC')
        .getRawMany();
    } catch (error) {
      console.error('AdminService-getDocsViews에서 에러 발생:', error);
      throw new InternalServerErrorException('서버 에러');
    }
  }
}
