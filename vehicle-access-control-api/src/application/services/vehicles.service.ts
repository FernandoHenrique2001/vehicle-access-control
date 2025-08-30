import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
} from '../../infrastructure/http/vehicles/dto/vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vehicle.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        barcode: true,
      },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        barcode: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    return vehicle;
  }

  async create(createVehicleDto: CreateVehicleDto) {
    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: createVehicleDto.userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Verificar se a placa já existe
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { license: createVehicleDto.license },
    });

    if (existingVehicle) {
      throw new BadRequestException('Placa já cadastrada');
    }

    return this.prisma.vehicle.create({
      data: {
        license: createVehicleDto.license,
        userId: createVehicleDto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
      },
    });
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    // Verificar se o veículo existe
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    // Se estiver atualizando a placa, verificar se já existe
    if (updateVehicleDto.license) {
      const vehicleWithSameLicense = await this.prisma.vehicle.findUnique({
        where: { license: updateVehicleDto.license },
      });

      if (vehicleWithSameLicense && vehicleWithSameLicense.id !== id) {
        throw new BadRequestException('Placa já cadastrada');
      }
    }

    // Se estiver atualizando o usuário, verificar se existe
    if (updateVehicleDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateVehicleDto.userId },
      });

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }
    }

    return this.prisma.vehicle.update({
      where: { id },
      data: updateVehicleDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // Verificar se o veículo existe
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existingVehicle) {
      throw new NotFoundException('Veículo não encontrado');
    }

    // Deletar em cascata: barcodes e entries
    await this.prisma.entry.deleteMany({
      where: { vehicleId: id },
    });

    await this.prisma.barcode.deleteMany({
      where: { vehicleId: id },
    });

    await this.prisma.vehicle.delete({
      where: { id },
    });
  }
}
