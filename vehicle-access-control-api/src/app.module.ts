import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { AuthModule } from './infrastructure/http/auth/auth.module';
import { UsersModule } from './infrastructure/http/users/users.module';
import { VehiclesModule } from './infrastructure/http/vehicles/vehicles.module';
import { BarcodesModule } from './infrastructure/http/barcodes/barcodes.module';
import { EntriesModule } from './infrastructure/http/entries/entries.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    VehiclesModule,
    BarcodesModule,
    EntriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
