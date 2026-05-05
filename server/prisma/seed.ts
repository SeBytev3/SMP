import { PrismaClient, UserRole, ProviderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import prisma from '../src/config/database';

dotenv.config();

async function main() {
  console.log('🌱 Seeding database...');

  const defaultPassword = 'Prueba123*';
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // 1. Create default service categories
  const categoriesData = [
    {
      nameEs: 'Plomero',
      nameEn: 'Plumber',
      descriptionEs: 'Servicios de plomería: reparación de fugas, instalación de tuberías, destape de drenajes, mantenimiento de sistemas de agua.',
      descriptionEn: 'Plumbing services: leak repair, pipe installation, drain unclogging, water system maintenance.',
    },
    {
      nameEs: 'Electricista',
      nameEn: 'Electrician',
      descriptionEs: 'Servicios eléctricos: instalación de cableado, reparación de cortocircuitos, instalación de luminarias, paneles eléctricos.',
      descriptionEn: 'Electrical services: wiring installation, short circuit repair, light fixture installation, electrical panels.',
    },
    {
      nameEs: 'Cerrajero',
      nameEn: 'Locksmith',
      descriptionEs: 'Servicios de cerrajería: apertura de puertas, duplicado de llaves, instalación de cerraduras, sistemas de seguridad.',
      descriptionEn: 'Locksmith services: door opening, key duplication, lock installation, security systems.',
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.serviceCategory.upsert({
      where: { id: cat.nameEs === 'Plomero' ? 'cat-plumber' : cat.nameEs === 'Electricista' ? 'cat-electrician' : 'cat-locksmith' },
      update: cat,
      create: {
        id: cat.nameEs === 'Plomero' ? 'cat-plumber' : cat.nameEs === 'Electricista' ? 'cat-electrician' : 'cat-locksmith',
        ...cat
      },
    });
    categories[cat.nameEs] = created;
    console.log(`✅ Category ensured: ${cat.nameEs}`);
  }

  // 2. Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@marketplace.com' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'admin@marketplace.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      languagePref: 'es',
    },
  });
  console.log('✅ Admin user ensured: admin@marketplace.com');

  // 3. Create Customers
  const customers = [
    { email: 'cguzman@gmail.com', firstName: 'Cristian', lastName: 'Guzman' },
    { email: 'stefa@gmail.com', firstName: 'Stefania', lastName: 'Ceron' },
    { email: 'jajajeje@gmail.com', firstName: 'Jaja', lastName: 'Jeje' },
  ];

  for (const customer of customers) {
    await prisma.user.upsert({
      where: { email: customer.email },
      update: { passwordHash: hashedPassword },
      create: {
        ...customer,
        passwordHash: hashedPassword,
        role: UserRole.CUSTOMER,
        languagePref: 'es',
      },
    });
    console.log(`✅ Customer ensured: ${customer.email}`);
  }

  // 4. Create Providers and Profiles
  const providers = [
    {
      email: 'sebesp@gmail.com',
      firstName: 'Sebastian',
      lastName: 'Espinosa',
      category: 'Electricista',
      profile: {
        bio: 'Tengo la chispa que necesita tu corazón',
        locationCity: 'Cali',
        locationRegion: 'Valle del Cauca',
        availabilityNotes: '24h',
        status: ProviderStatus.APPROVED,
      }
    },
    {
      email: 'brandon@gmail.com',
      firstName: 'Brandon',
      lastName: 'Ayala',
      category: 'Plomero',
      profile: {
        bio: 'Se todo sobre tubos',
        locationCity: 'Cali',
        locationRegion: 'Valle del Cauca',
        certifications: ['Plomerista'],
        availabilityNotes: '24h',
        status: ProviderStatus.APPROVED,
      }
    },
    {
      email: 'isalamasbella@gmail.com',
      firstName: 'Isa',
      lastName: 'Bella',
      category: 'Cerrajero',
      profile: {
        bio: 'Muchos años de experiencia abriendola',
        locationCity: 'Trujillo',
        locationRegion: 'Valle del Cauca',
        availabilityNotes: '24h',
        status: ProviderStatus.APPROVED,
      }
    },
  ];

  for (const p of providers) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { passwordHash: hashedPassword },
      create: {
        email: p.email,
        firstName: p.firstName,
        lastName: p.lastName,
        passwordHash: hashedPassword,
        role: UserRole.PROVIDER,
        languagePref: 'es',
      },
    });

    await prisma.providerProfile.upsert({
      where: { userId: user.id },
      update: {
        ...p.profile,
        serviceCategoryId: categories[p.category].id,
      },
      create: {
        ...p.profile,
        userId: user.id,
        serviceCategoryId: categories[p.category].id,
      },
    });
    console.log(`✅ Provider ensured: ${p.email}`);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
