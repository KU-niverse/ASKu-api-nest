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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WikiDoc,
      WikiDocsView,
      WikiFavorites,
      WikiHistory,
    ]),
    AuthModule,
    UserModule,
  ],
  controllers: [WikiController],
  providers: [WikiService, WikiRepository],
})
export class WikiModule {}
