import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from 'src/search/search.controller';
import { SearchService } from 'src/search/search.service';
import { SearchHistory } from 'src/search/searchHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}