import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { WikiDocsView } from 'src/wiki/entities/wikiView.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WikiDoc, WikiDocsView])],
})
export class WikiModule {}
