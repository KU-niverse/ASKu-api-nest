import { ConflictException, ForbiddenException, GoneException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { WikiRepository } from './wiki.repository';
import { UserRepository } from '../user/user.repository';
import { ContributionsResponseDto } from './dto/contributions-response.dto';
import { EditWikiDto } from './dto/editWiki.dto';
import { User } from '../user/entities/user.entity';
import { WikiHistory } from './entities/wikiHistory.entity';
import { WikiDoc } from './entities/wikiDoc.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/question/entities/question.entity';
import { Repository } from 'typeorm';
import { WikiDocsView } from 'src/wiki/entities/wikiView.entity';
import { WikiFavorites } from 'src/wiki/entities/wikiFavorites';
import { TotalContributionsListDto } from './dto/total-contributions-list.dto';
import { CreateWikiDto } from './dto/createWiki.dto';
import { UserAction } from 'src/user/entities/userAction.entity';

@Injectable()
export class WikiService {
  constructor(
    private wikiRepository: WikiRepository,
    private userRepository: UserRepository,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(WikiDoc)
    private wikiDocRepository: Repository<WikiDoc>,
    @InjectRepository(WikiDocsView)
    private readonly wikiDocsViewRepository: Repository<WikiDocsView>,
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
  ) {}
  // -------------------------이 아래로 영섭 작업물 -------------------------//
  async getRecentWikiHistoryByDocId(doc_id: number): Promise<WikiHistory> {
    const wikiHistory: WikiHistory =
      await this.wikiRepository.getWikiHistoryByDocId(doc_id);
    return wikiHistory;
  }

  async checkIndexExist(user: User, question_id: number) {
    console.log(
      '🚀 ~ WikiService ~ checkIndexExist ~ question_id:',
      question_id,
    );
    console.log('hihi');
    //질문 가져오기
    const question: Question = await this.questionRepository.findOne({
      where: { id: question_id },
    });
    console.log('🚀 ~ WikiService ~ checkIndexExist ~ question:', question);

    // 질문에 해당하는 문서를 가져와서 목차를 가져온다
    const recentWikiHistory: WikiHistory =
      await this.getRecentWikiHistoryByDocId(question.docId);
    console.log(
      '🚀 ~ WikiService ~ checkIndexExist ~ recentWikiHistory:',
      recentWikiHistory,
    );

    const wikiDoc: WikiDoc = await this.wikiRepository.getWikiDocsById(
      question.docId,
    );
    console.log('🚀 ~ WikiService ~ checkIndexExist ~ wikiDoc:', wikiDoc);

    const title: string = wikiDoc.title.replace(/\/+/g, '_');
    const version: number = Number(recentWikiHistory.version);
    let text: string = '';
    const jsonData = {};

    // S3에서 제목과 이름으로 이전 문서 가져오기
    text = await this.wikiRepository.getWikiContent(title, version);
    console.log('2');
    // 원래 통으로 가져오는 코드
    const lines = text.split(/\r?\n/);
    text = lines.join('\n');

    jsonData['version'] = version;
    jsonData['text'] = text;

    const sections = [];
    let current_section = null;
    let current_content = null;
    const numbers = [];
    console.log('3');
    // 파일 읽고 section 나누기
    for (const line of lines) {
      const matches = line.match(/^(={2,})\s+(.+?)\s+\1\s*$/); // 정규식 패턴에 맞는지 검사합니다.
      if (matches !== null) {
        // 해당 라인이 섹션 타이틀인 경우
        numbers.push(matches[1].length - 1);
        if (current_section !== null) {
          current_section.content.push(current_content);
          sections.push(current_section);
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
    console.log('4');
    if (current_section !== null) {
      // 마지막 섹션 push
      current_section.content.push(current_content);
      sections.push(current_section);
    }

    const content_json: any[] = this.indexSections(numbers, sections);
    jsonData['contents'] = content_json;

    const index_title_list = [];
    for (let i = 0; i < content_json.length; i++) {
      index_title_list.push(
        content_json[i].index + ' ' + content_json[i].title,
      );
    }
    console.log('5');
    const found = index_title_list.includes(question.indexTitle);

    // 목차를 순회하면서 질문과 같은 목차가 있는지 확인한다
    // 같은 목차가 있으면 res에 based_on_section: true, section: section을 넣어서 보낸다
    if (found) {
      jsonData['based_on_section'] = true;
      const section = index_title_list.indexOf(question.indexTitle) + 1;
      jsonData['section'] = section;
    }
    // 같은 목차가 없으면 res에 based_on_section: false를 넣어서 보낸다
    else {
      jsonData['based_on_section'] = false;
    }
    console.log('6');
    jsonData['success'] = true;
    console.log('6');
    return jsonData;
  }

  async getTotalContentsByVersion(
    title: string,
    version: number,
    calltype: number,
    user?: User,
  ) {
    const doc: WikiDoc = await this.getWikiDocsByTitle(title);
    console.log('🚀 ~ WikiService ~ doc:', doc);
    const docId = doc.id;
    const recentHistory: WikiHistory =
      await this.getRecentWikiHistoryByDocId(docId);
    const parsedTitle: string = title.replace(/\/+/g, '_');

    // 로그인 시에만, 조회수 증가
    if (user?.id) {
      const wikiDocsView: WikiDocsView = new WikiDocsView();
      wikiDocsView.docId = docId;
      wikiDocsView.userId = user.id;
      await this.wikiDocsViewRepository.save(wikiDocsView);
    }

    // TODO: 아래 케이스 테스트 요함
    if (!recentHistory) {
      throw new NotFoundException('존재하지 않는 문서입니다.');
    }
    let using_version;
    if (calltype === 1) {
      // 글 불러오거나 수정용
      using_version = recentHistory.version;
    } else if (calltype === 2) {
      // 버전별 글 불러오기용
      using_version = version;
    }

    let text = '';
    const jsonData: {
      contents: any[];
    } = { contents: [] };
    jsonData['is_managed'] = doc.isManaged;

    // 삭제된 문서인지 확인
    if (!this.checkWikiIsRemoved(docId)) {
      // 410반환
      throw new GoneException('삭제된 문서입니다.');
    }

    // 가장 최근 버전의 파일 읽어서 jsonData에 저장
    //S3에서 파일 읽어오는 코드
    text = await this.wikiRepository.getWikiContent(parsedTitle, using_version);

    // 원래 통으로 가져오는 코드
    const lines = text.split(/\r?\n/);
    text = lines.join('\n');

    jsonData['version'] = using_version;
    jsonData['text'] = text;
    jsonData['contents'] = [];
    console.log('🚀 ~ WikiService ~ jsonData:', jsonData);

    const sections = [];
    let current_section = null;
    let current_content = '';
    let is_started = false;
    const numbers = [];

    // 파일 읽고 section 나누기
    for (let line of lines) {
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

    this.indexSections(numbers, sections).forEach((obj) => {
      jsonData.contents.push(obj);
    });

    jsonData['success'] = true;
    if (user?.id) {
      const rows = await this.getWikiFavoriteByUserIdAndDocId(user.id, docId);
      if (rows.length === 0) {
        jsonData['is_favorite'] = false;
      } else {
        jsonData['is_favorite'] = true;
      }
    } else {
      jsonData['is_favorite'] = false;
    }
    return jsonData;
  }
  async getWikiDocsByTitle(title: string): Promise<WikiDoc> {
    const wikiDoc: WikiDoc = await this.wikiDocRepository.findOne({
      where: { title },
    });
    return wikiDoc;
  }

  async checkWikiIsRemoved(docId: number): Promise<boolean> {
    const wikiDoc: WikiDoc = await this.wikiDocRepository.findOne({
      where: { id: docId },
    });
    return wikiDoc.isDeleted;
  }

  async getWikiFavoriteByUserIdAndDocId(
    userId: number,
    docId: number,
  ): Promise<WikiDoc[]> {
    const favoriteDocs: WikiDoc[] = await this.wikiDocRepository
      .createQueryBuilder('wd')
      .innerJoin(WikiFavorites, 'wf', 'wf.doc_id = wd.id')
      .where('wf.userId = :user_id', { userId })
      .andWhere('wf.docId = :doc_id', { docId })
      .orderBy('wf.createdAt', 'DESC')
      .getMany();

    return favoriteDocs;
  }

  // 수정 시 기존 섹션 텍스트 불러오기
  async getContentsBySection(
    title: string,
    section_number: number,
    user: User,
  ) {
    const doc: WikiDoc = await this.getWikiDocsByTitle(title);
    console.log('🚀 ~ WikiService ~ doc:', doc);
    const docId = doc.id;
    const recentHistory: WikiHistory =
      await this.getRecentWikiHistoryByDocId(docId);
    const parsedTitle: string = title.replace(/\/+/g, '_');
    console.log('🚀 ~ WikiService ~ parsedTitle:', parsedTitle);
    const version = recentHistory.version;
    console.log('🚀 ~ WikiService ~ version:', version);

    let text = '';
    let sections = [];
    let jsonData = {};
    let section = null;

    // S3에서 파일 읽어오는 코드
    text = await this.wikiRepository.getWikiContent(parsedTitle, version);

    // 정규화로 섹션 분리
    const lines = text.split(/\r?\n/);
    console.log('🚀 ~ WikiService ~ lines:', lines);
    let current_section = null;
    let current_content = null;

    for (let line of lines) {
      const matches = line.match(/^(={2,})\s+(.+?)\s+\1\s*$/); // 정규식 패턴에 맞는지 검사합니다.
      if (matches !== null) {
        // 해당 라인이 섹션 타이틀인 경우
        if (current_section !== null) {
          current_section.content.push(current_content);
          sections.push(current_section);
        }
        current_section = {
          title: line,
          content: [],
        };
        current_content = '';
      } else {
        // 해당 라인이 섹션 내용인 경우
        if (current_content !== '') {
          current_content += '\n';
        }
        current_content += line;
      }
    }
    if (current_section !== null) {
      current_section.content.push(current_content);
      sections.push(current_section);
    }
    console.log('🚀 ~ WikiService ~ sections:', sections);

    // 섹션 번호에 맞는 섹션 불러오기
    section = sections[section_number - 1];
    console.log('🚀 ~ WikiService ~ section:', section);
    jsonData = {};
    jsonData['doc_id'] = docId;
    jsonData['version'] = version;
    jsonData['title'] = title;
    jsonData['content'] = section.content.join('\n');
    jsonData['is_managed'] = doc.isManaged;
    jsonData['success'] = true;

    return jsonData;
  }

  // -------------------------이 위로 영섭 작업물 -------------------------//
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

  async getDocsContributionsList(): Promise<TotalContributionsListDto[]> {
    const results = await this.wikiRepository.getDocsContributionsList();
    return results.map((result) => new TotalContributionsListDto(result));
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

    const docsContributions =
      await this.wikiRepository.getDocsContributions(userId);

    // Calculate total_point
    const total_point = docsContributions.reduce(
      (sum, doc) => sum + Number(doc.doc_point),
      0,
    );

    return {
      count: totalUsers,
      ranking,
      point: user_point,
      ranking_percentage: Number(ranking_percentage.toFixed(4)),
      docs: docsContributions.map((doc) => ({
        ...doc,
        doc_point: doc.doc_point.toString(),
        percentage:
          total_point === 0
            ? '0.0000'
            : (Number(doc.doc_point) / total_point).toFixed(4),
      })),
    };
  }

  // 진권
  async getWikiContributions(doc_id: number): Promise<any> {
    const contributorPoints = await this.wikiRepository.getContributorPoints(doc_id);    
    return contributorPoints;
  }

  // 특정 히스토리를 bad로 변경
  async badHistoryById(id: number, user: User,): Promise<number> {
    if (!user.isAuthorized || !user.isAdmin) {
      throw new ForbiddenException('관리자만 히스토리 변경이 가능합니다.');
    }

    const result = await this.wikiHistoryRepository.update(id, { isBad: true });
    
    const wikiHistory = await this.wikiHistoryRepository.findOne({ where: { id } });
    if (wikiHistory) {
      // 해당 히스토리에서 작성한 유저의 기여도와 기록 횟수를 재계산하는 repository 계층 함수
      await this.wikiRepository.recalculatePoint(wikiHistory.userId);
    }

    return result.affected || 0;
  }
  // ↑↑↑

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

  //todo: wikidocs를 반환하는 Dto 생성

  async searchWikiDocsByTitle(title: string, userId: number) {
    const result = await this.wikiRepository.searchWikiDocsByTitle(
      title,
      userId,
    );
    if (!result || result.length === 0) {
      throw new NotFoundException('문서를 찾을 수 없습니다.');
    }
    return result;
  }
  // TODO: 이미지 업로드 로직을 위한 새로운 메서드 추가

  async getWikiHistoryByDocId(docId: number): Promise<WikiHistory[]> {
    return this.wikiRepository.getWikiHistoryUserByDocId(docId);
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

  async fetchSectionContent(
    title: string,
    section_number: number,
    user: User,
  ) {
    const doc: WikiDoc = await this.getWikiDocsByTitle(title); 
    const docId = doc.id;
  
    const recentHistory: WikiHistory = await this.getRecentWikiHistoryByDocId(docId); 
    const parsedTitle: string = title.replace(/\/+/g, '_'); 
    const version = recentHistory.version;
  
    const text = await this.wikiRepository.getWikiContent(parsedTitle, version);
  
    const lines = text.split(/\r?\n/);
    console.log('🚀 ~ WikiService ~ lines:', lines);
  
    let current_section = null;
    let current_content = '';
    const sections = [];
    let is_started = false; 
  
    for (let line of lines) {
      const matches = line.match(/^(={2,})\s+(.+?)\s+\1\s*$/); 
      if (matches !== null) {
        if (current_section !== null) {
          current_section.content.push(current_content);
          sections.push(current_section); 
        }
        current_section = {
          title: matches[2],
          content: [],
        };
        current_content = '';
      } else {
        is_started = true;
        if (current_content !== '') {
          current_content += '\n';
        }
        current_content += line;
      }
    }
  
    if (current_section !== null) {
      current_section.content.push(current_content);
      sections.push(current_section);
    } else if (!is_started) {
      sections.push({
        title: 'No Section Title',
        content: lines,
      });
    }
    
    if (section_number > sections.length || section_number < 1) {
      throw new NotFoundException('해당 섹션을 찾을 수 없습니다.');
    }
  
    const section = sections[section_number - 1];
  
    const jsonData = {
      doc_id: docId,
      version: version,
      title: title,
      content: section.content.join('\n'), 
      is_managed: doc.isManaged,
      success: true,
    };
  
    return jsonData;
  }
  async updateUserAction(user: User, diff: number, actionType: string) {
    try {  
      let userAction = await UserAction.findOne({ where: { userId: user.id } });
      if (!userAction) {
        userAction = new UserAction();
        userAction.userId = user.id;
      }
  
      if (actionType === 'recordCount') {
        userAction.recordCount += diff;
      } else if (actionType === 'reviseCount') {
        userAction.reviseCount += 1;
      } else if (actionType === 'answerCount') {
        userAction.answerCount += 1;
      }
  
      await userAction.save();
    } catch (error) {
      console.error('User action 업데이트 중 오류:', error);
      throw new InternalServerErrorException('기여도 업데이트 중 오류 발생');
    }
  }
}
