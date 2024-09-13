import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { WikiRepository } from './wiki.repository';
import { UserRepository } from '../user/user.repository';
import { ContributionsResponseDto } from './dto/contributions-response.dto';
import { EditWikiDto } from './dto/editWiki.dto';
import { User } from '../user/entities/user.entity';
import { WikiHistory } from './entities/wikiHistory.entity';
import { WikiDoc } from './entities/wikiDoc.entity';
import { CreateWikiDto } from './dto/createWiki.dto';

@Injectable()
export class WikiService {
  constructor(
    private wikiRepository: WikiRepository,
    private userRepository: UserRepository,
  ) {}

  async getWikiHistoryByUserId(userId: number): Promise<WikiHistory[]> {
    return this.wikiRepository.getWikiHistoryByUserId(userId);
  }

  async getAllWikiDocs(): Promise<string[]> {
    return this.wikiRepository.getAllDocTitles();
  }

  async getWikiDocsIdByTitle(title: string): Promise<number> {
    const wikiDoc = await this.wikiRepository.findDocByTitle(title);
    if (!wikiDoc) {
      throw new NotFoundException('Document not found');
    }
    console.log('Found document ID:', wikiDoc);

    return wikiDoc.id;
  }

  async getRandomWikiDoc(): Promise<{ [key: string]: string | boolean }> {
    const randomWikiDoc = await this.wikiRepository.getRandomDoc();
    return {
      '0': randomWikiDoc ? randomWikiDoc.title : 'No Document Found',
      success: true,
    };
  }

  async getContents(title: string) {
    // TODO: 이 메서드를 더 작은 단위의 메서드로 분리하여 가독성 개선
    const doc = await this.wikiRepository.findDocByTitle(title);
    if (!doc) {
      return {
        success: false,
        message: '존재하지 않는 문서입니다.',
        statusCode: 404,
      };
    }
    if (doc.isDeleted) {
      return { success: false, message: '삭제된 문서입니다.', statusCode: 410 };
    }

    const recentHistory = await this.wikiRepository.getMostRecentHistory(
      doc.id,
    );
    if (!recentHistory) {
      return {
        success: false,
        message: '존재하지 않는 문서입니다.',
        statusCode: 404,
      };
    }

    const version = recentHistory.version;
    let text = await this.wikiRepository.getWikiContent(title, version);

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

    const sections = this.parseSections(lines);
    const numbers = sections.map((section) => section.level);

    if (sections.length === 0) {
      jsonData.contents.push({
        section: '0',
        index: '0',
        title: '들어가며',
        content: text,
      });
    } else {
      this.indexSections(numbers, sections).forEach((obj) => {
        jsonData.contents.push(obj);
      });
    }

    return jsonData;
  }

  async editWikiDoc(title: string, editWikiDto: EditWikiDto, user: User) {
    //TODO: 앞쪽 히스토리 저장과 뒤쪽 히스토리 저장이 모두 완료가 되었을때만 성공 반환. transactional 처리 요망
    try {
      const doc = await this.wikiRepository.findDocByTitle(title);
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

      const recentHistory = await this.wikiRepository.getMostRecentHistory(
        doc.id,
      );
      if (recentHistory.version !== editWikiDto.version) {
        return {
          success: false,
          message: 'Version is not matched',
          statusCode: 426,
          new_content: editWikiDto.new_content,
        };
      }

      const newVersion = recentHistory.version + 1;
      await this.wikiRepository.saveWikiContent(
        title,
        newVersion,
        editWikiDto.new_content,
      );

      // TODO: newHistory를 활용하는 로직 구현 (예: 기여도 계산, 알림 생성 등)
      const newHistory = await this.wikiRepository.createHistory({
        userId: user.id,
        docId: doc.id,
        textPointer: `${process.env.S3_ENDPOINT}${process.env.S3_BUCKET_NAME}/${title}/r${newVersion}.wiki`,
        summary: editWikiDto.summary,
        count: editWikiDto.new_content.length,
        diff: editWikiDto.new_content.length - recentHistory.count,
        version: newVersion,
        isQBased: Boolean(editWikiDto.is_q_based),
        isRollback: false,
        indexTitle: editWikiDto.index_title,
      });
      await this.wikiRepository.saveNewHistory(newHistory);

      // TODO: 기여도 로직 추가 요함

      return { success: true, message: '위키 문서 수정 성공', statusCode: 200 };
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
    await this.wikiRepository.updateDoc(id, { isDeleted: true });
  }

  async getWikiFavoriteByUserId(userId: number): Promise<WikiDoc[]> {
    return this.wikiRepository.getFavoritesByUserId(userId);
  }

  async addWikiFavorite(userId: number, title: string) {
    const doc = await this.wikiRepository.findDocByTitle(title);
    if (!doc) {
      return {
        success: false,
        message: '존재하지 않는 문서입니다.',
        status: 404,
      };
    }

    const existingFavorite = await this.wikiRepository.findFavorite(
      userId,
      doc.id,
    );
    if (existingFavorite) {
      return {
        success: false,
        message: '이미 즐겨찾기에 추가된 문서입니다.',
        status: 200,
      };
    }

    await this.wikiRepository.createFavorite(userId, doc.id);
    return { success: true, message: '위키 즐겨찾기 추가 성공', status: 200 };
  }

  async deleteWikiFavorite(userId: number, title: string) {
    const doc = await this.wikiRepository.findDocByTitle(title);
    if (!doc) {
      return {
        success: false,
        message: '존재하지 않는 문서입니다.',
        status: 404,
      };
    }

    await this.wikiRepository.deleteFavorite(userId, doc.id);
    return { success: true, message: '위키 즐겨찾기 삭제 성공', status: 200 };
  }

  async getUserContributions(
    userId: number,
  ): Promise<ContributionsResponseDto> {
    const totalUsers = await this.userRepository.getTotalUsers();
    const userRankingAndPoint =
      await this.userRepository.getUserRankingAndPoint(userId);

    const { ranking, user_point } = userRankingAndPoint;

    let ranking_percentage = (ranking / totalUsers) * 100;
    if (user_point === 0) {
      ranking_percentage = 100;
    }

    const docsContributions = await this.wikiRepository.getDocsContributions(
      userId,
      user_point,
    );

    return {
      count: totalUsers,
      ranking,
      point: user_point,
      ranking_percentage: Number(ranking_percentage.toFixed(4)),
      docs: docsContributions.map((doc) => ({
        ...doc,
        doc_point: doc.doc_point.toString(),
        percentage: doc.percentage.toString(),
      })),
    };
  }

  private parseSections(
    lines: string[],
  ): { level: number; title: string; content: string[] }[] {
    const sections = [];
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const matches = line.match(/^(={2,})\s+(.+?)\s+\1\s*$/);
      if (matches) {
        if (currentSection) {
          currentSection.content = currentContent;
          sections.push(currentSection);
        }
        currentSection = {
          level: matches[1].length - 1,
          title: matches[2],
          content: [],
        };
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    if (currentSection) {
      currentSection.content = currentContent;
      sections.push(currentSection);
    }

    return sections;
  }

  private indexSections(
    numbers: number[],
    sections: { level: number; title: string; content: string[] }[],
  ) {
    const content_json = [];
    let num_list = [];
    let idx = 1;

    for (let i = 0; i < numbers.length; i++) {
      const section_dic = {
        section: (i + 1).toString(),
        index: '',
        title: sections[i].title,
        content: sections[i].content.join('\n'),
      };

      const num = numbers[i];

      if (num === 1) {
        num_list = [idx++];
        section_dic.index = num_list[0].toString();
      } else {
        if (num > num_list.length) {
          while (num_list.length < num) num_list.push(1);
        } else {
          while (num_list.length > 0 && num < num_list.length) {
            num_list.pop();
          }
          const tmp = num_list[num_list.length - 1];
          num_list.pop();
          num_list.push(tmp + 1);
        }
        section_dic.index = num_list.join('.');
      }

      content_json.push(section_dic);
    }

    return content_json;
  }

  // TODO: 이미지 업로드 로직을 위한 새로운 메서드 추가

  async getWikiHistoryByDocId(docId: number): Promise<WikiHistory[]> {
    return this.wikiRepository.getWikiHistoryByDocId(docId);
  }

  async getHistorysByTitle(title: string): Promise<any[]> {
    const doc_id = await this.getWikiDocsIdByTitle(title);
    const historys = await this.getWikiHistoryByDocId(doc_id);  // 문서 ID로 히스토리 가져오기
    return historys;
  }

  async getRecentWikiHistorys(type: string): Promise<any[]> {
    return this.wikiRepository.getRecentWikiHistorys(type);
  }

  async getHistoryRawData(title: string, version: number): Promise<any> {
    const docId = await this.getWikiDocsIdByTitle(title);
    const wikiContent = await this.wikiRepository.getWikiContent(title, version);

    // S3에서 가져온 텍스트 처리
    const lines = wikiContent.split(/\r?\n/).join('\n');

    return {
      doc_id: docId,
      version,
      text: lines,
    };
  }

  //post wiki/historys/:title(*)/version/:version
  async rollbackWikiVersion(
    title: string, 
    rollbackVersion: number, 
    user: User
  ): Promise<void> {
    const doc = await this.wikiRepository.findDocByTitle(title);

    if (!doc) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }

    const recentHistory = await this.wikiRepository.getMostRecentHistory(doc.id);
    const currentVersion = recentHistory.version;

    if (doc.isManaged && !user.isAuthorized) {
      throw new ForbiddenException('인증된 회원만 롤백이 가능합니다.');
    }

    const newVersion = currentVersion + 1;
    const content = await this.wikiRepository.getWikiContent(title, rollbackVersion);
    const lines = content.split(/\r?\n/).join('\n');

    await this.wikiRepository.saveWikiContent(title, newVersion, lines);

    const newHistory = await this.wikiRepository.createHistory({
      userId: user.id,
      docId: doc.id,
      textPointer: `${process.env.S3_ENDPOINT}/${title}/r${newVersion}.wiki`,
      summary: `version ${rollbackVersion}으로 롤백`,
      count: lines.length,
      diff: lines.length - recentHistory.count,
      version: newVersion,
      isRollback: true,
      indexTitle: recentHistory.indexTitle,
    });

    const filteredContent = this.filterWikiContent(lines);
    await this.wikiRepository.updateRecentContent(doc.id, filteredContent);
  }

  private filterWikiContent(text: string): string {
    text = text.replace(/\n([^=].*?)\n/g, "$1 ");
    text = text.replace(/'''([^=].*?)'''/g, "$1");
    text = text.replace(/''(.+?)''/g, "$1");
    text = text.replace(/--(.+?)--/g, "$1");
    text = text.replace(/&amp;/g, "&");
    text = text.replace(/={2,}/g, "");
    text = text.replace(/\[\[.*http.*\]\]/g, "");
    text = text.replace(/\[\[(.+?)\]\]/g, "$1");
    return text.replace(/\n/g, " ");
  }

  async createHistory(historyData: Partial<WikiHistory>): Promise<void> {
    await this.wikiRepository.createHistory(historyData);
  }


  //post wiki/contents/new/:title(*)
  async createNewWikiDocument(title: string, createWikiDto: CreateWikiDto, user: User) {
    const docId = await this.wikiRepository.getWikiDocsIdByTitle(title);

    if (docId !== null) {
      const row = await this.wikiRepository.getWikiDocsById(docId);
      if (row.isDeleted) {
      } else {
        throw new ConflictException('이미 존재하는 문서입니다.');
      }
    }

    const sanitizedTitle = title.replace(/\/+/g, '_');
    const text = createWikiDto.text;
    const version = 1;
    const type = createWikiDto.type;

    await this.wikiRepository.saveWikiContent(sanitizedTitle, version, text);

    const endpoint = 'https://kr.object.ncloudstorage.com';
    const newWikiDoc = {
      title,
      textPointer: `${endpoint}/wiki-bucket/${sanitizedTitle}/r${version}.wiki`,
      recentFilteredContent: text,
      type,
      latestVer: version,
      isManaged: 0,
    };

    const savedDoc = await this.wikiRepository.createWikiDoc(newWikiDoc);

    const count = text.length;
    const summary = '새 위키 문서 생성';
    
    await this.wikiRepository.createHistory({
      userId: user.id,
      docId: savedDoc.id,
      textPointer: `${endpoint}/wiki-bucket/${sanitizedTitle}/r${version}.wiki`,
      summary,
      count,
      diff: count,
      version,
      isRollback: false,
      indexTitle: createWikiDto.index_title,
    });

    return {
      success: true,
      message: '위키 문서 생성 성공',
      docId: savedDoc.id,
      version,
      count,
      summary: '새 위키 문서 생성',
      textPointer: `${endpoint}/wiki-bucket/${sanitizedTitle}/r${version}.wiki`,
      diff: count,
      statusCode: 201,
    };
  }
}
