import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Report } from "./entities/report.entity";
import { WikiHistory } from "src/wiki/entities/wikiHistory.entity";
import { Question } from "src/question/entities/question.entity";
import { Debate } from "src/debate/entities/debate.entity";
import { DebateHistory } from "src/debate/entities/debateHistory.entity";
import { WikiService } from "src/wiki/wiki.service";

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private report: Repository<Report>,
        @InjectRepository(WikiHistory)
        private wikiRepository: Repository<WikiHistory>,
        @InjectRepository(Question)
        private question: Repository<Question>,
        @InjectRepository(Debate)
        private debate: Repository<Debate>,
        @InjectRepository(DebateHistory)
        private debateRepository: Repository<DebateHistory>,
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
                await this.wikiRepository.update(target, { isBad: true });
                const wikiHistory = await this.wikiRepository.findOne({ where: { id: target } });
                await this.wikiservice.recalculatePoint(wikiHistory.userId);
                break;
            }
            case 2: {
                await this.question.update(target, { isBad: true });
                break;
            }
            case 3: {
                await this.debate.update(target, { isBad: true });
                break;
            }
            case 4: {
                await this.debateRepository.update(target, { isBad: true });
                break;
            }
            default:
                break;
        }

        return this.report.update(reportId, { isChecked: 1 });
    }
}