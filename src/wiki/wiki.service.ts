import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WikiHistory } from './entities/wikiHistory.entity';
import { Repository } from 'typeorm';
import { WikiDoc } from './entities/wikiDoc.entity';
import { WikiFavorites } from './entities/wikiFavorites';
import { WikiDocsView } from './entities/wikiView.entity';
import { EditWikiDto } from './dto/editWiki.dto';
import { User } from 'src/user/entities/user.entity';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const edp = 'https://kr.object.ncloudstorage.com/';
const region = 'kr-standard';

@Injectable()
export class WikiService {
  private readonly s3Client: S3Client;

  constructor(
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
    @InjectRepository(WikiDoc)
    private wikiDocRepository: Repository<WikiDoc>,
    @InjectRepository(WikiFavorites)
    private readonly wikiFavoriteRepository: Repository<WikiFavorites>,
    @InjectRepository(WikiDocsView)
    private readonly wikiDocsViewRepository: Repository<WikiDocsView>,
  ) {
    this.s3Client = new S3Client({
      region,
      endpoint: edp,
      credentials: {
        accessKeyId: process.env.ACCESSKEY,
        secretAccessKey: process.env.SECRETACCESSKEY,
      },
    });
  }

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

  // 전체 글 불러오기 / 특정 버전 전체 글 불러오기 때 둘다 쓰임, req.calltype으로 구분
  async getContents(title: string) {
    try {
      const doc = await this.wikiDocRepository.findOne({ where: { title } });

      // 존재 여부 확인
      if (!doc) {
        return {
          success: false,
          message: '존재하지 않는 문서입니다.',
          statusCode: 404,
        };
      }

      // 삭제 여부 확인
      if (doc.isDeleted) {
        return {
          success: false,
          message: '삭제된 문서입니다.',
          statusCode: 410,
        };
      }

      // 히스토리 존재 여부 확인
      const docId = doc.id;
      const recentHistory = await this.wikiHistoryRepository.findOne({
        where: { docId },
        order: { createdAt: 'DESC' },
      });

      if (!recentHistory) {
        return {
          success: false,
          message: '존재하지 않는 문서입니다.',
          statusCode: 404,
        };
      }

      // version 선언 - 수정 필요
      // const version =
      //   req['calltype'] === 1 ? recentHistory.version : req['version']; // 1: 글 불러오거나 수정 2: 버전별 글 불러오기
      const version = recentHistory.version;
      let text = await this.getWikiContent(title, version);

      const lines = text.split(/\r?\n/);
      text = lines.join('\n');

      const jsonData = {
        is_managed: doc.isManaged,
        version,
        text,
        contents: [],
        success: true,
        is_favorite: false,
      };

      const sections = [];
      let current_section = null;
      let current_content = '';
      let is_started = false;
      const numbers = [];

      // 파일 읽고 section 나누기
      for (const line of lines) {
        const matches = line.match(/^(={2,})\s+(.+?)\s+\1\s*$/); // 정규식 패턴에 맞는지 검사합니다.
        if (matches !== null) {
          // 해당 라인이 섹션 타이틀인 경우
          numbers.push(matches[1].length - 1);
          if (current_section !== null) {
            current_section.content.push(current_content);
            sections.push(current_section);
          } else {
            // 목차 없이 그냥 글만 있는 경우
            is_started = true;
            if (current_content.trim() !== '') {
              jsonData.contents.push({
                section: '0',
                index: '0',
                title: '들어가며',
                content: current_content,
              });
            }
          }
          current_section = {
            title: matches[2],
            content: [],
          };
          current_content = '';
        } else {
          // 해당 라인이 섹션 내용인 경우
          if (current_content !== '') {
            // 빈 줄이면
            current_content += '\n';
          }
          current_content += line;
        }
      }
      if (current_section !== null) {
        // 마지막 섹션 push
        current_section.content.push(current_content);
        sections.push(current_section);
      } else if (current_content !== null && !is_started) {
        // 목차가 아예 없는 경우
        jsonData.contents.push({
          section: '0',
          index: '0',
          title: '들어가며',
          content: current_content,
        });
      }

      this.indexing(numbers, sections).forEach((obj) => {
        jsonData.contents.push(obj);
      });

      jsonData['success'] = true;

      // // TODO: 위키 즐겨찾기 확인 로직 - JwtAuthGuard 필요
      // if (user) {
      // }
      // if (req.isAuthenticated()) {
      //   const rows = await Wiki.Wiki_favorite.getWikiFavoriteByUserIdAndDocId(
      //     req.user[0].id,
      //     doc_id,
      //   );
      //   if (rows.length === 0) {
      //     jsonData['is_favorite'] = false;
      //   } else {
      //     jsonData['is_favorite'] = true;
      //   }
      // } else {
      //   jsonData['is_favorite'] = false;
      // }

      // // TODO: 조회수 증가 로직 - JwtAuthGuard 필요
      // if (req.isAuthenticated()) {
      //   const wikiDocsView = new WikiDocsView();
      //   wikiDocsView.docId = docId;
      //   wikiDocsView.userId = req.user.id;
      //   await this.wikiDocsViewRepository.save(wikiDocsView);

      //   const favorite = await this.wikiFavoriteRepository.findOne({
      //     where: { docId, userId: req.user.id },
      //   });
      //   jsonData.is_favorite = !!favorite;
      // }

      return jsonData;
    } catch (err) {
      console.error(err);
      return {
        success: false,
        message: '위키 불러오기 중 오류',
        statusCode: 500,
      };
    }
  }

  // 이전 위키 내용 가져오기
  private async getWikiContent(
    title: string,
    version: number,
  ): Promise<string> {
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

  // 위키 내용 s3에 저장
  private async saveWikiContent(
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

  // 인덱싱 함수
  private indexing = (numbers, sections) => {
    const content_json = []; // content의 메타데이터와 데이터
    let num_list = []; // index의 리스트
    let idx = 1; // 가장 상위 목차

    // 인덱싱
    for (let i = 0; i < numbers.length; i++) {
      const section_dic = {}; // section : section, index : index, title: title, content: content
      section_dic['section'] = (i + 1).toString();
      const num = numbers[i];

      if (num === 1) {
        // 가장 상위 목차가 변경됐을 경우
        num_list = [idx++];
        section_dic['index'] = num_list[0].toString();
      } else {
        if (num > num_list.length) {
          // 하위 목차로 들어갈 때
          while (num_list.length < num) num_list.push(1);
        } else {
          while (num_list.length > 0 && num < num_list.length) {
            // depth가 똑같아질 때까지 pop
            num_list.pop();
          }
          const tmp = num_list[num_list.length - 1]; // 한 단계 올리기
          num_list.pop();
          num_list.push(tmp + 1);
        }
        section_dic['index'] = num_list.join('.');
      }

      // title과 content 저장
      section_dic['title'] = sections[i].title;
      let content_text = '';
      for (const content of sections[i].content) {
        content_text += content;
      }
      section_dic['content'] = content_text;

      content_json.push(section_dic);
    }

    return content_json;
  };

  async getWikiDocsIdByTitle(title: string): Promise<number> {
    const wikiDoc = await this.wikiDocRepository.findOne({ where: { title } });

    if (!wikiDoc) {
      throw new NotFoundException('Document not found');
    }

    return wikiDoc.id;
  }

  async getWikiDocsById(id: number): Promise<WikiDoc> {
    const wikiDoc = await this.wikiDocRepository.findOne({ where: { id } });

    if (!WikiDoc) {
      throw new NotFoundException('Document not found');
    }

    return wikiDoc;
  }

  async editWikiDoc(title: string, editWikiDto: EditWikiDto, user: User) {
    try {
      const doc = await this.wikiDocRepository.findOne({ where: { title } });
      if (!doc) {
        return {
          success: false,
          message: '존재하지 않는 문서입니다.',
          statusCode: 404,
        };
      }

      if (doc.isManaged && !user.isAuthorized) {
        return {
          success: false,
          message: '인증된 회원만 편집이 가능한 문서입니다.',
          statusCode: 403,
        };
      }

      const recentHistory = await this.wikiHistoryRepository.findOne({
        where: { docId: doc.id },
        order: { createdAt: 'DESC' },
      });

      if (recentHistory.version !== editWikiDto.version) {
        return {
          success: false,
          message: 'Version is not matched',
          statusCode: 426,
          new_content: editWikiDto.new_content,
        };
      }

      const newVersion = recentHistory.version + 1;
      await this.saveWikiContent(title, newVersion, editWikiDto.new_content);

      const newHistory = this.wikiHistoryRepository.create({
        userId: user.id,
        docId: doc.id,
        textPointer: `${edp}wiki-bucket/${title}/r${newVersion}.wiki`,
        summary: editWikiDto.summary,
        count: editWikiDto.new_content.length,
        diff: editWikiDto.new_content.length - recentHistory.count,
        version: newVersion,
        isQBased: Boolean(editWikiDto.is_q_based),
        isRollback: false,
        indexTitle: editWikiDto.index_title,
      });
      await this.wikiHistoryRepository.save(newHistory);

      // TODO: createHistoryMid, wikiPointMid, newActionRecord, newActionRevise, newActionAnswer, newNotice

      return {
        success: true,
        message: '위키 문서 수정 성공',
        statusCode: 200,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: '위키 문서 수정 중 오류',
        statusCode: 500,
      };
    }
  }

  async deleteWikiDocsById(id: number): Promise<void> {
    const result = await this.wikiDocRepository.update(id, { isDeleted: true });

    if (result.affected === 0) {
      throw new InternalServerErrorException('Failed to delete document');
    }
  }
}
