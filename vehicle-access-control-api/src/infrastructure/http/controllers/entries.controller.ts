import { Controller, Get, Post, Query, Param, UseGuards } from '@nestjs/common';
import { EntriesService } from '../../../application/services/entries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: { startDate?: string; endDate?: string } = {};
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    return this.entriesService.findAll(filters);
  }

  @Post('scan/:barcodeCode')
  scanBarcodeAndCreateEntry(@Param('barcodeCode') barcodeCode: string) {
    return this.entriesService.scanBarcodeAndCreateEntry(barcodeCode);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboardData(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange: { startDate?: string; endDate?: string } = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    return this.entriesService.getDashboardData(dateRange);
  }
}
