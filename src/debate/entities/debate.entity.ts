import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('debates')
export class Debate extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '토론의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '관련 문서 ID' })
  docId: number;

  @ManyToOne(() => WikiDoc, { nullable: false, eager: true })
  @JoinColumn({ name: 'doc_id' })
  wikiDoc: WikiDoc;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '토론을 시작한 사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20, nullable: false })
  @ApiProperty({ description: '토론 주제', maxLength: 20 })
  subject: string;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '토론 생성 시간', type: String })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  @ApiProperty({ description: '가장 마지막으로 토론한 시각', type: String })
  recentEditedAt: Date;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({
    description: '[토론 종료 여부] 0: 진행 중, 1: 종료됨',
    default: false,
  })
  doneOrNot: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: '토론 종료 시간', nullable: true, type: String })
  doneAt: Date | null;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({
    description: '[부적절한 토론인지 여부] 0: 적절, 1: 부적절',
    default: false,
  })
  isBad: boolean;
}
