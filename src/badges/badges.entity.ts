import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Badge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 20,
  })
  name: string;

  @Column('text')
  image: string; // 로컬에 저장된 이미지의 링크

  @Column('text')
  description: string;

  @Column({
    type: 'bool',
    default: 0,
  })
  event: boolean; // [배지의 특성] 0: 일반, 1: 이벤트

  @Column({
    type: 'bool',
    default: 0,
  })
  cont: boolean; // [배지의 특성] 0: 단일, 1: 연속
}
