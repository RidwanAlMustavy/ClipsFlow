import { prisma } from '@clipsflow/db';
import * as bcrypt from 'bcrypt';

async function main() {
  console.log('Seeding database...');
  const passwordHash = await bcrypt.hash('ridwan112', 10);

  // 1. Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { passwordHash, role: 'SUPER_ADMIN' },
    create: {
      email: 'admin@gmail.com',
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin seeded (admin@gmail.com / ridwan112)');

  // 2. Create an Agency
  const agency = await prisma.agency.upsert({
    where: { subdomain: 'demo' },
    update: { name: 'ClipsFlow' },
    create: {
      name: 'ClipsFlow',
      subdomain: 'demo',
      stripeCustomerId: 'cus_demo123',
    }
  });

  // 3. Agency Admin
  const agencyAdmin = await prisma.user.upsert({
    where: { email: 'agency@gmail.com' },
    update: { passwordHash, role: 'AGENCY_ADMIN', agencyId: agency.id },
    create: {
      email: 'agency@gmail.com',
      passwordHash,
      role: 'AGENCY_ADMIN',
      agencyId: agency.id
    },
  });
  console.log('✅ Agency Admin seeded (agency@gmail.com / ridwan112)');

  // 4. Create a Client under the Agency
  const client = await prisma.client.upsert({
    where: { id: 'client_demo_1' },
    update: {},
    create: {
      id: 'client_demo_1',
      name: 'TechCorp Client',
      agencyId: agency.id,
    }
  });

  // 5. Client User
  await prisma.user.upsert({
    where: { email: 'client@gmail.com' },
    update: { passwordHash, role: 'CLIENT', clientId: client.id, agencyId: agency.id },
    create: {
      email: 'client@gmail.com',
      passwordHash,
      role: 'CLIENT',
      clientId: client.id,
      agencyId: agency.id
    },
  });
  console.log('✅ Client User seeded (client@gmail.com / ridwan112)');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
