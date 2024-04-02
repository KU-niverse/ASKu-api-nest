import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  BaseEntity,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { User } from 'src/user/user.entity';

@Entity('wiki_favorites')
export class WikiFavorites extends BaseEntity {
  @PrimaryColumn({ type: 'int' })
  @ApiProperty({ description: '즐겨찾기된 문서 ID' })
  docId: number;

  @ManyToOne(() => WikiDoc, { nullable: false })
  @JoinColumn({ name: 'doc_id' })
  doc: WikiDoc;

  @PrimaryColumn({ type: 'int' })
  @ApiProperty({ description: '즐겨찾기를 추가한 사용자 ID' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ nullable: false })
  @ApiProperty({ description: '즐겨찾기 추가 시간', type: String })
  createdAt: Date;
}
