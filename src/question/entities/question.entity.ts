import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { User } from 'src/user/user.entity';

@Entity('questions')
export class Question extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '질문의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '질문이 속한 문서 ID' })
  docId: number;

  @ManyToOne(() => WikiDoc, { nullable: false })
  @JoinColumn({ name: 'doc_id' })
  doc: WikiDoc;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '질문을 작성한 사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '목차 제목 (예: 1. 개요)' })
  indexTitle: string;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '질문 내용' })
  content: string;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '질문 생성 시간', type: String })
  createdAt: Date;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
  })
  @ApiProperty({
    description: '[답변 여부] 0: 답변 없음, 1: 답변 있음',
    default: false,
  })
  answerOrNot: boolean;

  @Column({
    type: 'bool',
    default: false,
    nullable: false,
  })
  @ApiProperty({
    description: '[부적절한 질문인지 여부] 0: 적절, 1: 부적절',
    default: false,
  })
  isBad: boolean;
}
