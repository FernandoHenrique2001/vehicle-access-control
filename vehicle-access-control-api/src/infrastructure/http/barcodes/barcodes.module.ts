import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { BarcodesService } from '../../../application/services/barcodes.service';
import { BarcodesController } from '../controllers/barcodes.controller';

@Module({
  imports: [PrismaModule],
  providers: [BarcodesService],
  controllers: [BarcodesController],
  exports: [BarcodesService],
})
export class BarcodesModule {}
