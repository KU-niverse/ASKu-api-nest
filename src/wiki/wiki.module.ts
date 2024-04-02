import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WikiDoc])],
})
export class WikiModule {}
