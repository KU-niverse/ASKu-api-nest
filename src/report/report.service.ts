import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./entities/report.entity";

@Injectable()
export class ReportService {
    private logger = new Logger(ReportService.name);

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

    async handleCheckReport(id: number, isChecked: number, user: { isAdmin: boolean }): Promise<any> {
        if (!user || !user.isAdmin) {
            throw new HttpException('관리자가 아닙니다.', HttpStatus.FORBIDDEN);
        }

        if (isChecked !== 1) {
            throw new HttpException('잘못된 확인값입니다.', HttpStatus.NOT_ACCEPTABLE);
        }
        const result = await this.checkReport(id, isChecked);

        if (result && result.changedRows === 1) {
            const report = await this.getReport(id);
            await this.updateAction(report.userId, 3, 0);
            return { success: true, message: '신고를 확인했습니다.' };
        } else {
            throw new HttpException('이미 확인한 신고입니다.', HttpStatus.BAD_REQUEST);
        }
    }

    async checkReport(id: number, isChecked: number): Promise<any> {
        if (isChecked === 1) {
          const report = await this.getReport(id);
          if (!report) {
            this.logger.error(`Report with id ${id} not found`);
            throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
          }
    
          const typeId = report.typeId;
          const target = report.target;
          const userId = report.userId;
    
          switch (typeId) {
            case 1: {
              await this.reportRepository.query(`UPDATE wiki_history SET is_bad = 1 WHERE id = ?`, [target]);
              const [rows] = await this.reportRepository.query(`SELECT user_id FROM wiki_history WHERE id = ?`, [target]);
              await this.recalculatePoint(rows.user_id);
              await this.updateAction(rows.user_id, 3, 1);
              break;
            }
            case 2: {
              await this.reportRepository.query(`UPDATE questions SET is_bad = 1 WHERE id = ?`, [target]);
              await this.updateAction(userId, 5, 1);
              break;
            }
            case 3: {
              await this.reportRepository.query(`UPDATE debates SET is_bad = 1 WHERE id = ?`, [target]);
              await this.updateAction(userId, 4, 1);
              break;
            }
            case 4: {
              await this.reportRepository.query(`UPDATE debate_history SET is_bad = 1 WHERE id = ?`, [target]);
              await this.updateAction(userId, 4, 1);
              break;
            }
            default:
              break;
          }
    
          switch (typeId) {
            case 1:
              await this.reportRepository.query(
                `UPDATE user_action SET 
                  record_count = (SELECT SUM(CASE WHEN diff > 0 THEN diff ELSE 0 END) FROM wiki_history WHERE user_id = ? AND is_bad = 0 AND is_rollback = 0),
                  revise_count = (SELECT COUNT(*) FROM wiki_history WHERE user_id = ? AND is_bad = 0),
                  answer_count = (SELECT COUNT(*) FROM wiki_history WHERE user_id = ? AND is_q_based = 1 AND is_bad = 0)
                 WHERE user_id = ?`, 
                [userId, userId, userId, userId]
              );
              break;
            case 2:
              await this.reportRepository.query(
                `UPDATE user_action SET question_count = (SELECT COUNT(*) FROM questions WHERE user_id = ? AND is_bad = 0) WHERE user_id = ?`, 
                [userId, userId]
              );
              break;
            case 4:
              await this.reportRepository.query(
                `UPDATE user_action SET debate_count = (SELECT COUNT(*) FROM debate_history WHERE user_id = ? AND is_bad = 0) WHERE user_id = ?`, 
                [userId, userId]
              );
              break;
            default:
              break;
          }
    
          const [result] = await this.reportRepository.query(`SELECT badge_id FROM badge_history WHERE user_id = ? AND is_bad = 0`, [userId]);
          const badgeIds = [result.badge_id];
    
          const [userActionResult] = await this.reportRepository.query(`SELECT * FROM user_action WHERE user_id = ?`, [userId]);
          const userAction = userActionResult[0];
    
          for (const badgeId of badgeIds) {
            switch (typeId) {
                case 1:
                if (
                  (badgeId === 3 && userAction.record_count < 100) ||
                  (badgeId === 4 && userAction.record_count < 1000) ||
                  (badgeId === 5 && userAction.record_count < 2500) ||
                  (badgeId === 6 && userAction.record_count < 5000) ||
                  (badgeId === 7 && userAction.record_count < 10000) ||
                  (badgeId === 8 && userAction.revise_count < 1) ||
                  (badgeId === 9 && userAction.revise_count < 3) ||
                  (badgeId === 10 && userAction.revise_count < 10) ||
                  (badgeId === 11 && userAction.revise_count < 20) ||
                  (badgeId === 27 && userAction.answer_count < 1) ||
                  (badgeId === 28 && userAction.answer_count < 30) ||
                  (badgeId === 29 && userAction.answer_count < 100) ||
                  (badgeId === 30 && userAction.answer_count < 200)
                ) {
                  await this.reportRepository.query(
                    "UPDATE badge_history SET is_bad = 1 WHERE user_id = ? AND badge_id = ?",
                    [userId, badgeId]
                  );
                }
                break;
              case 2:
                if (
                  (badgeId === 24 && userAction.question_count < 1) ||
                  (badgeId === 25 && userAction.question_count < 10) ||
                  (badgeId === 26 && userAction.question_count < 30)
                ) {
                  await this.reportRepository.query(
                    "UPDATE badge_history SET is_bad = 1 WHERE user_id = ? AND badge_id = ?",
                    [userId, badgeId]
                  );
                }
                break;
              case 4:
                if (
                  (badgeId === 21 && userAction.debate_count < 1) ||
                  (badgeId === 22 && userAction.debate_count < 10) ||
                  (badgeId === 23 && userAction.debate_count < 30)
                ) {
                  await this.reportRepository.query(
                    "UPDATE badge_history SET is_bad = 1 WHERE user_id = ? AND badge_id = ?",
                    [userId, badgeId]
                  );
                }
                break;
              default:
                break;
            }
          }
        }
    
        const result = await this.reportRepository.query(
          `UPDATE reports SET is_checked = ? WHERE id = ?`,
          [isChecked, id] 
        );
        return result;
      }
    
    
      async updateAction(userId: number, countType: number, diff: number) {
        let sql;
        switch (countType) {
          case 1:
            if (diff < 0) diff = 0;
            sql = `UPDATE user_action SET record_count = record_count + ? WHERE user_id = ?`;
            await this.reportRepository.query(sql, [diff, userId]);
            break;
          case 2:
            sql = `UPDATE user_action SET revise_count = revise_count + 1 WHERE user_id = ?`;
            await this.reportRepository.query(sql, [userId]);
            break;
          case 3:
            sql = `UPDATE user_action SET report_count = report_count + 1 WHERE user_id = ?`;
            await this.reportRepository.query(sql, [userId]);
            break;
          case 4:
            sql = `UPDATE user_action SET debate_count = debate_count + 1 WHERE user_id = ?`;
            await this.reportRepository.query(sql, [userId]);
            break;
          case 5:
            sql = `UPDATE user_action SET question_count = question_count + 1 WHERE user_id = ?`;
            await this.reportRepository.query(sql, [userId]);
            break;
          case 6:
            sql = `UPDATE user_action SET like_count = like_count + 1 WHERE user_id = ?`;
            await this.reportRepository.query(sql, [userId]);
            break;
          case 7:
            sql = `UPDATE user_action SET answer_count = answer_count + 1 WHERE user_id = ?`;
            await this.reportRepository.query(sql, [userId]);
            break;
          default:
            return -1;
        }
    }
    async recalculatePoint(userId: number) {
        try {
            const result = await this.reportRepository.query(
                "UPDATE users SET point = (SELECT SUM(CASE WHEN diff > 0 AND is_q_based = 1 THEN diff * 5 WHEN diff > 0 THEN diff * 4 ELSE 0 END) FROM wiki_history WHERE user_id = ? AND is_bad = 0 AND is_rollback = 0) WHERE id = ?",
                [userId, userId]
            );    
            return result.affectedRows;
        } catch (error) {
            throw new HttpException('Error recalculating points', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}