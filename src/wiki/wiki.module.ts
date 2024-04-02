import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { WikiFavorites } from 'src/wiki/entities/wikiFavorites';
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';
import { WikiDocsView } from 'src/wiki/entities/wikiView.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WikiDoc,
      WikiDocsView,
      WikiFavorites,
      WikiHistory,
    ]),
  ],
})
export class WikiModule {}
