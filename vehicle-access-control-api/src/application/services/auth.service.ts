import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(cpf: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { cpf } });

    // Verificar se o usuário existe e tem senha
    if (!user || !user.password) {
      throw new UnauthorizedException(
        'Usuário não encontrado ou não tem acesso ao sistema',
      );
    }

    // Verificar se a senha está correta
    if (await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException('Senha incorreta');
  }

  async login(user: any) {
    const payload = { username: user.cpf, sub: user.id };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        cpf: user.cpf,
        name: user.name,
        type: user.type,
      },
    };
  }
}
