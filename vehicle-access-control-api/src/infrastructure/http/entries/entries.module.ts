import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { EntriesService } from '../../../application/services/entries.service';
import { EntriesController } from '../controllers/entries.controller';

@Module({
  imports: [PrismaModule],
  providers: [EntriesService],
  controllers: [EntriesController],
  exports: [EntriesService],
})
export class EntriesModule {}
