import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { VehiclesService } from '../../../application/services/vehicles.service';
import { VehiclesController } from '../controllers/vehicles.controller';

@Module({
  imports: [PrismaModule],
  providers: [VehiclesService],
  controllers: [VehiclesController],
  exports: [VehiclesService],
})
export class VehiclesModule {}
