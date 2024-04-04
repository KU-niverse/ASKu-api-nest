import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from 'src/search/searchHistory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory])],
})
export class SearchModule {}
