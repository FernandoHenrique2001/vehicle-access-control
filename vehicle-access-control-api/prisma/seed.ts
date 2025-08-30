import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const adminPassword = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.upsert({
    where: { cpf: '701.226.686-42' },
    update: {},
    create: {
      name: 'Admin User',
      cpf: '701.226.686-42',
      password: adminPassword,
      type: 'ADMIN',
    },
  });

  console.log('✅ Usuário admin criado:', admin.name);

  // Criar alguns usuários de exemplo (sem senha - usuários comuns)
  const user1 = await prisma.user.upsert({
    where: { cpf: '111.111.111-11' },
    update: {},
    create: {
      name: 'Alice Wonderland',
      cpf: '111.111.111-11',
      type: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { cpf: '222.222.222-22' },
    update: {},
    create: {
      name: 'Bob The Builder',
      cpf: '222.222.222-22',
      type: 'USER',
    },
  });

  console.log('✅ Usuários de exemplo criados');

  // Criar veículos
  const vehicle1 = await prisma.vehicle.upsert({
    where: { license: 'ABC-1234' },
    update: {},
    create: {
      license: 'ABC-1234',
      userId: user1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { license: 'XYZ-7890' },
    update: {},
    create: {
      license: 'XYZ-7890',
      userId: user2.id,
    },
  });

  const vehicle3 = await prisma.vehicle.upsert({
    where: { license: 'QWE-5678' },
    update: {},
    create: {
      license: 'QWE-5678',
      userId: user1.id,
    },
  });

  console.log('✅ Veículos de exemplo criados');

  // Criar códigos de barras
  const barcode1 = await prisma.barcode.upsert({
    where: { code: 'VEHICLE1BARCODE' },
    update: {},
    create: {
      code: 'VEHICLE1BARCODE',
      vehicleId: vehicle1.id,
    },
  });

  console.log('✅ Códigos de barras de exemplo criados');

  // Criar algumas entradas de exemplo
  const entry1 = await prisma.entry.create({
    data: {
      entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 horas atrás
      exitTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hora atrás
      vehicleId: vehicle1.id,
      barcodeId: barcode1.id,
    },
  });

  const entry2 = await prisma.entry.create({
    data: {
      entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 horas atrás
      exitTime: null, // Ainda dentro
      vehicleId: vehicle2.id,
      barcodeId: barcode1.id, // Usando o mesmo código por simplicidade
    },
  });

  console.log('✅ Entradas de exemplo criadas');

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
