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
import { User } from 'src/user/entities/user.entity';

@Entity('wiki_history')
export class WikiHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '위키 히스토리의 고유 식별자' })
  id: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '작성한 사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '관련 문서 ID' })
  docId: number;

  @ManyToOne(() => WikiDoc, { nullable: false })
  @JoinColumn({ name: 'doc_id' })
  wikiDoc: WikiDoc;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '위키 문서 원본 링크' })
  textPointer: string;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '버전 번호' })
  version: number;

  @Column('text', { nullable: false })
  @ApiProperty({ description: '위키 수정 내용 요약' })
  summary: string;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '생성된 시간', type: String })
  createdAt: Date;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({ description: '질문 기반 수정 여부', default: false })
  isQBased: boolean;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '글자수' })
  count: number;

  @Column({ type: 'int', nullable: false })
  @ApiProperty({ description: '이전 히스토리와의 변경 글자수' })
  diff: number;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({ description: '부적절한 히스토리인지 여부', default: false })
  isBad: boolean;

  @Column({ type: 'bool', default: false, nullable: false })
  @ApiProperty({ description: '롤백 히스토리인지 여부', default: false })
  isRollback: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    default: '전체',
    nullable: false,
  })
  @ApiProperty({ description: '목차 제목', default: '전체', maxLength: 255 })
  indexTitle: string;
}
