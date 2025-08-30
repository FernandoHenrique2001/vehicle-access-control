import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { User } from '@prisma/client';
import {
  CreateUserDto,
  UpdateUserDto,
} from '../../infrastructure/http/users/dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validar se o CPF já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { cpf: createUserDto.cpf },
    });

    if (existingUser) {
      throw new BadRequestException('CPF já cadastrado');
    }

    // Se não tiver senha ou senha for undefined/null, é um usuário comum
    if (
      !createUserDto.password ||
      createUserDto.password === undefined ||
      createUserDto.password === null
    ) {
      return this.prisma.user.create({
        data: {
          name: createUserDto.name,
          cpf: createUserDto.cpf,
          type: 'USER',
        },
      });
    }

    // Se tiver senha (mesmo que vazia), é um admin
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        name: createUserDto.name,
        cpf: createUserDto.cpf,
        password: hashedPassword,
        type: 'ADMIN',
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar se o usuário existe
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Se estiver atualizando o CPF, verificar se já existe
    if (updateUserDto.cpf && updateUserDto.cpf !== existingUser.cpf) {
      const userWithSameCpf = await this.prisma.user.findUnique({
        where: { cpf: updateUserDto.cpf },
      });

      if (userWithSameCpf) {
        throw new BadRequestException('CPF já cadastrado');
      }
    }

    const updateData: Partial<{
      name: string;
      cpf: string;
      password: string | null;
      type: string;
    }> = {};

    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.cpf) updateData.cpf = updateUserDto.cpf;

    if (updateUserDto.password !== undefined) {
      if (!updateUserDto.password || updateUserDto.password.trim() === '') {
        // Se a senha for vazia, remover a senha (usuário comum)
        updateData.password = null;
        updateData.type = 'USER';
      } else {
        // Se a senha não for vazia, fazer hash e definir como admin
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
        updateData.type = 'ADMIN';
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }

  async findUserOptions() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.cpf})`,
    }));
  }
}
