import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WikiHistory } from './entities/wikiHistory.entity';
import { WikiDoc } from './entities/wikiDoc.entity';
import { WikiFavorites } from './entities/wikiFavorites';
import { WikiDocsView } from './entities/wikiView.entity';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class WikiRepository {
  private readonly s3Client: S3Client;
  constructor(
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
    @InjectRepository(WikiDoc)
    private wikiDocRepository: Repository<WikiDoc>,
    @InjectRepository(WikiFavorites)
    private wikiFavoriteRepository: Repository<WikiFavorites>,
    @InjectRepository(WikiDocsView)
    private wikiDocsViewRepository: Repository<WikiDocsView>,
  ) {
    console.log('Initializing S3Client with region:', process.env.AWS_REGION);
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);

    // TODO: S3 설정을 환경 변수로 분리
    this.s3Client = new S3Client({
      region: 'kr-standard',
      endpoint: 'https://kr.object.ncloudstorage.com/',
      credentials: {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETACCESSKEY,
      },
    });
  }

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    return this.wikiHistoryRepository.find({
      where: { userId: userId },
      relations: ['wikiDoc'],
    });3
  }

  async getMostRecentHistory(docId: number): Promise<WikiHistory> {
    return this.wikiHistoryRepository.findOne({
      where: { docId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDocsContributions(userId: number, userPoint: number) {
    return this.wikiHistoryRepository
      .createQueryBuilder('wh')
      .select('wh.docId', 'doc_id')
      .addSelect('wd.title', 'doc_title')
      .addSelect(
        'SUM(CASE WHEN wh.diff > 0 AND wh.isQBased = 1 THEN wh.diff * 5 ' +
          'WHEN wh.diff > 0 THEN wh.diff * 4 ELSE 0 END)',
        'doc_point',
      )
      .addSelect(
        'CAST(SUM(CASE WHEN wh.diff > 0 AND wh.isQBased = 1 THEN wh.diff * 5 ' +
          'WHEN wh.diff > 0 THEN wh.diff * 4 ELSE 0 END) / :totalPoint * 100 AS DECIMAL(5,4))',
        'percentage',
      )
      .innerJoin('wh.wikiDoc', 'wd')
      .where('wh.userId = :userId', { userId })
      .andWhere('wh.isBad = 0')
      .andWhere('wh.isRollback = 0')
      .groupBy('wh.docId')
      .addGroupBy('wd.title')
      .orderBy('doc_point', 'DESC')
      .setParameter('totalPoint', userPoint)
      .getRawMany();
  }

  async createHistory(historyData: Partial<WikiHistory>): Promise<WikiHistory> {
    const newHistory = this.wikiHistoryRepository.create(historyData);
    return this.wikiHistoryRepository.save(newHistory);
  }

  // WikiDoc 관련 메서드
  async findDocByTitle(title: string): Promise<WikiDoc> {
    return this.wikiDocRepository.findOne({ where: { title } });
  }


  async getAllDocTitles(): Promise<string[]> {
    const docs = await this.wikiDocRepository.find({
      where: { isDeleted: false },
      select: ['title'],
    });
    return docs.map((doc) => doc.title);
  }

  async getRandomDoc(): Promise<WikiDoc> {
    return this.wikiDocRepository
      .createQueryBuilder('wikiDoc')
      .select('wikiDoc.title')
      .where('wikiDoc.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('RAND()')
      .limit(1)
      .getOne();
  }

  async updateDoc(id: number, data: Partial<WikiDoc>): Promise<void> {
    await this.wikiDocRepository.update(id, data);
  }

  // WikiFavorites 관련 메서드
  async getFavoritesByUserId(userId: number): Promise<WikiDoc[]> {
    const favorites = await this.wikiFavoriteRepository.find({
      where: { userId },
      relations: ['doc'],
    });
    return favorites.map((favorite) => favorite.doc);
  }

  async findFavorite(userId: number, docId: number): Promise<WikiFavorites> {
    return this.wikiFavoriteRepository.findOne({ where: { userId, docId } });
  }

  async createFavorite(userId: number, docId: number): Promise<WikiFavorites> {
    const newFavorite = this.wikiFavoriteRepository.create({ userId, docId });
    return this.wikiFavoriteRepository.save(newFavorite);
  }

  async deleteFavorite(userId: number, docId: number): Promise<void> {
    await this.wikiFavoriteRepository.delete({ userId, docId });
  }

  // WikiDocsView 관련 메서드
  async createView(docId: number, userId: number): Promise<WikiDocsView> {
    const wikiDocsView = new WikiDocsView();
    wikiDocsView.docId = docId;
    wikiDocsView.userId = userId;
    return this.wikiDocsViewRepository.save(wikiDocsView);
  }

  async getWikiContent(title: string, version: number): Promise<string> {
    // TODO: S3 버킷 이름을 환경 변수로 분리
    const replacedTitle = title.replace(/\/+/g, '_');
    const getObjectCommand = new GetObjectCommand({
      Bucket: 'wiki-bucket',
      Key: `${replacedTitle}/r${version}.wiki`,
    });
    const response = await this.s3Client.send(getObjectCommand);
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
  }

  async saveWikiContent(
    title: string,
    version: number,
    content: string,
  ): Promise<void> {
    const replacedTitle = title.replace(/\/+/g, '_');
    const putObjectCommand = new PutObjectCommand({
      Bucket: 'wiki-bucket',
      Key: `${replacedTitle}/r${version}.wiki`,
      Body: content,
    });
    await this.s3Client.send(putObjectCommand);
  }

  // TODO: 이미지 업로드를 위한 S3 관련 메서드 추가
  async saveNewHistory(history: WikiHistory): Promise<WikiHistory> {
    return this.wikiHistoryRepository.save(history);
  }

  // getWikiHistoryByDocId
  async getWikiHistoryByDocId(docId: number): Promise<any[]> {
    return this.wikiHistoryRepository
      .createQueryBuilder('wh')
      .select(['wh', 'u.nickname'])
      .innerJoin('wh.user', 'u') // users 테이블과 조인
      .where('wh.doc_id = :docId', { docId })
      .orderBy('wh.createdAt', 'DESC')
      .getMany();
  }

  async getRecentWikiHistorys(type: string): Promise<any[]> {
    return this.wikiHistoryRepository
      .createQueryBuilder('wh')
      .select([
        'wh.id',
        'wh.userId',
        'wh.docId',
        'wh.version',
        'wh.summary',
        'wh.createdAt',
        'wh.diff',
        'wh.isRollback',
        'wd.title',
        'u.nickname',
      ])
      .innerJoin('wh.wikiDoc', 'wd')
      .innerJoin('wh.user', 'u')
      .where(
        `(CASE 
          WHEN :type = 'create' THEN wh.version = 1 
          WHEN :type = 'rollback' THEN wh.isRollback = 1 
          ELSE true 
        END)`,
        { type },
      )
      .orderBy('wh.createdAt', 'DESC')
      .limit(30)
      .getMany();
  }

  async getWikiDocsIdByTitle(title: string): Promise<number | null> {
    const doc = await this.wikiDocRepository.findOne({ where: { title } });
    return doc ? doc.id : null;
  }

  async updateRecentContent(docId: number, text: string): Promise<void> {
    await this.wikiDocRepository.update(docId, { recentFilteredContent: text });
  }
}
