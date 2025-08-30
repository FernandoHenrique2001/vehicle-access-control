import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: { startDate?: string; endDate?: string }) {
    const whereClause: {
      entryTime?: {
        gte?: Date;
        lt?: Date;
      };
    } = {};

    if (filters?.startDate) {
      whereClause.entryTime = {
        gte: new Date(filters.startDate),
      };
    }

    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setDate(endDate.getDate() + 1);
      whereClause.entryTime = {
        ...whereClause.entryTime,
        lt: endDate,
      };
    }

    return this.prisma.entry.findMany({
      where: whereClause,
      include: {
        vehicle: {
          select: {
            id: true,
            license: true,
            user: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
          },
        },
        barcode: {
          select: {
            id: true,
            code: true,
          },
        },
      },
      orderBy: {
        entryTime: 'desc',
      },
    });
  }

  async scanBarcodeAndCreateEntry(barcodeCode: string) {
    // Buscar o código de barras
    const barcode = await this.prisma.barcode.findUnique({
      where: { code: barcodeCode },
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
      throw new NotFoundException(
        'Código de barras não encontrado ou inválido',
      );
    }

    if (!barcode.vehicle) {
      throw new BadRequestException(
        'Veículo associado ao código de barras não encontrado',
      );
    }

    // Verificar se já existe uma entrada aberta para este veículo
    const existingOpenEntry = await this.prisma.entry.findFirst({
      where: {
        vehicleId: barcode.vehicle.id,
        exitTime: null,
      },
    });

    if (existingOpenEntry) {
      // Se existe, esta é uma saída
      return this.prisma.entry.update({
        where: { id: existingOpenEntry.id },
        data: {
          exitTime: new Date(),
        },
        include: {
          vehicle: {
            select: {
              id: true,
              license: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  cpf: true,
                },
              },
            },
          },
          barcode: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      });
    } else {
      // Se não existe, esta é uma entrada
      return this.prisma.entry.create({
        data: {
          vehicleId: barcode.vehicle.id,
          barcodeId: barcode.id,
        },
        include: {
          vehicle: {
            select: {
              id: true,
              license: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  cpf: true,
                },
              },
            },
          },
          barcode: {
            select: {
              id: true,
              code: true,
            },
          },
        },
      });
    }
  }

  async getDashboardData(dateRange?: { startDate?: string; endDate?: string }) {
    let relevantEntries = await this.findAll(dateRange);

    if (!dateRange?.startDate && !dateRange?.endDate) {
      // Padrão: últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      relevantEntries = await this.prisma.entry.findMany({
        where: {
          entryTime: {
            gte: sevenDaysAgo,
          },
        },
        include: {
          vehicle: {
            select: {
              id: true,
              license: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  cpf: true,
                },
              },
            },
          },
          barcode: {
            select: {
              id: true,
              code: true,
            },
          },
        },
        orderBy: {
          entryTime: 'desc',
        },
      });
    }

    // Calcular contagens diárias
    const dailyCounts: { [key: string]: number } = {};
    relevantEntries.forEach((entry) => {
      const date = new Date(entry.entryTime).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const dailyAccessCounts = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      entries: relevantEntries,
      dailyAccessCounts,
    };
  }
}
