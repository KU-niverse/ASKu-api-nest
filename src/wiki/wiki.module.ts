import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WikiDoc } from 'src/wiki/entities/wikiDoc.entity';
import { WikiFavorites } from 'src/wiki/entities/wikiFavorites';
import { WikiHistory } from 'src/wiki/entities/wikiHistory.entity';
import { WikiDocsView } from 'src/wiki/entities/wikiView.entity';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { WikiRepository } from './wiki.repository';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from '../user/user.module';
import { QuestionModule } from 'src/question/question.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WikiDoc,
      WikiDocsView,
      WikiFavorites,
      WikiHistory,
      User,
    ]),
    QuestionModule,
    AuthModule,
    UserModule,
  ],
  controllers: [WikiController],
  providers: [WikiService, WikiRepository],
  exports: [WikiService, TypeOrmModule],
})
export class WikiModule {}
