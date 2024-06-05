import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';
import { Question } from 'src/question/entities/question.entity';
import { Debate } from 'src/debate/entities/debate.entity';
import { DebateHistory } from 'src/debate/entities/debateHistory.entity';
import { WikiService } from 'src/wiki/wiki.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private report: Repository<Report>,
    @InjectRepository(WikiHistory)
    private wikiHistoryRepository: Repository<WikiHistory>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Debate)
    private debateRepository: Repository<Debate>,
    @InjectRepository(DebateHistory)
    private debateHistoryRepository: Repository<DebateHistory>,
    private wikiservice: WikiService,
  ) {}
  async getReport(id: number): Promise<Report> {
    return this.report.findOne({ where: { id } });
  }

  async checkReport(reportId: number, isChecked: number): Promise<any> {
    const report = await this.getReport(reportId);
    const typeId = report.typeId;
    const target = report.target;
    const userId = report.userId;

    switch (typeId) {
      case 1: {
        await this.wikiHistoryRepository.update(target, { isBad: true });
        const wikiHistory = await this.wikiHistoryRepository.findOne({
          where: { id: target },
        });
        await this.wikiservice.recalculatePoint(wikiHistory.userId);
        break;
      }
      case 2: {
        await this.questionRepository.update(target, { isBad: true });
        break;
      }
      case 3: {
        await this.debateRepository.update(target, { isBad: true });
        break;
      }
      case 4: {
        await this.debateHistoryRepository.update(target, { isBad: true });
        break;
      }
      default:
        break;
    }

    return this.report.update(reportId, { isChecked: 1 });
  }
}
