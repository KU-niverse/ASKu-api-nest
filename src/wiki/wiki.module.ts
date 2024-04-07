import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { WikiFavorites } from 'src/wiki/entities/wikiFavorites';
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';
import { WikiDocsView } from 'src/wiki/entities/wikiView.entity';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WikiDoc,
      WikiDocsView,
      WikiFavorites,
      WikiHistory,
    ]),
  ],
  controllers: [WikiController],
  providers: [WikiService],
})
export class WikiModule {}
