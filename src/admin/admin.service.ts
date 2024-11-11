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
      const result = await this.wikiDocRepository
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
          'A.updatedAt as updated_at',
          'A.isManaged as is_managed',
          'CONVERT(COUNT(*), SIGNED) as docs_views',  // MySQL에서 명시적으로 정수로 변환

        ])
        .groupBy('B.doc_id')
        .orderBy('docs_views', 'DESC')
        .getRawMany();
      return result.map(item => ({
        ...item,
        docs_views: Number(item.docs_views)
      }));
    } catch (error) {
      console.error('AdminService-getDocsViews에서 에러 발생:', error);
      throw new InternalServerErrorException('서버 에러');
    }
  }
}
