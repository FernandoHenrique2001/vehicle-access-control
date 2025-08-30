import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BarcodesService } from '../../../application/services/barcodes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('barcodes')
export class BarcodesController {
  constructor(private readonly barcodesService: BarcodesService) {}

  @Post('generate/:vehicleId')
  @UseGuards(JwtAuthGuard)
  generateBarcodeForVehicle(@Param('vehicleId') vehicleId: string) {
    return this.barcodesService.generateBarcodeForVehicle(vehicleId);
  }

  @Get('vehicle/:vehicleId')
  @UseGuards(JwtAuthGuard)
  findByVehicleId(@Param('vehicleId') vehicleId: string) {
    return this.barcodesService.findByVehicleId(vehicleId);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.barcodesService.findByCode(code);
  }
}
