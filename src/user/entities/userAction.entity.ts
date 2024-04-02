import {
  Entity,
  PrimaryColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

@Entity('user_action')
export class UserAction extends BaseEntity {
  @PrimaryColumn({ type: 'int' })
  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '일반 기록 글자수', default: 0 })
  recordCount: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '일반 수정 횟수', default: 0 })
  reviseCount: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '일반 신고 횟수', default: 0 })
  reportCount: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '일반 토론 작성 개수', default: 0 })
  debateCount: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '일반 질문 개수', default: 0 })
  questionCount: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '일반 추천 개수', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0, nullable: false })
  @ApiProperty({ description: '일반 답변 개수', default: 0 })
  answerCount: number;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({ description: '이벤트 초기 이벤트: 용도 미정', default: false })
  eventBegin: boolean;
}
