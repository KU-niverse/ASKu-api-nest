import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./entities/report.entity";

@Injectable()
export class ReportService {
    constructor(
        @InjectRepository(Report)
        private reportRepository: Repository<Report>,
    ) {}

    async createReport(newReport: Partial<Report>): Promise<Report> {
        const result = await this.reportRepository.save(newReport);
        return this.getReport(result.id);
    }

    async getReport(id: number): Promise<Report> {
        return this.reportRepository.findOne({ where: { id } });
    }
}