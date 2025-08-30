import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class BarcodesService {
  constructor(private prisma: PrismaService) {}

  async generateBarcodeForVehicle(vehicleId: string) {
    // Verificar se o veículo existe
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    // Remover código de barras existente se houver
    await this.prisma.barcode.deleteMany({
      where: { vehicleId },
    });

    // Gerar código único baseado na placa e timestamp
    const timestamp = Date.now();
    const licenseClean = vehicle.license.replace(/[^A-Z0-9]/g, '');
    const code = `${licenseClean}${timestamp}`.toUpperCase();

    // Criar novo código de barras
    return this.prisma.barcode.create({
      data: {
        code,
        vehicleId,
      },
      include: {
        vehicle: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
          },
        },
      },
    });
  }

  async findByVehicleId(vehicleId: string) {
    const barcode = await this.prisma.barcode.findUnique({
      where: { vehicleId },
      include: {
        vehicle: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
          },
        },
      },
    });

    return barcode;
  }

  async findByCode(code: string) {
    const barcode = await this.prisma.barcode.findUnique({
      where: { code },
      include: {
        vehicle: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
          },
        },
      },
    });

    if (!barcode) {
      throw new NotFoundException('Código de barras não encontrado');
    }

    return barcode;
  }
}
