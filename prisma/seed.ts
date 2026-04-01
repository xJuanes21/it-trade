import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Upsert super admin to ensure it exists with correct credentials and approval
  const adminPasswordHash = await bcrypt.hash("Admin@2026!", 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@ittrade.com" },
    update: {
      isApproved: true,
      isActive: true,
      role: "superadmin",
      // Ensure credential exists or update it? 
      // Upserting nested relations is tricky if they exist. 
      // Simplest is to strict ensure fields on User, and handle credential separately if needed.
      // But for seed, let's just ensure isApproved is true.
      
    },
    create: {
      email: "admin@ittrade.com",
      name: "Super Administrador",
      role: "superadmin",
      isApproved: true,
      isActive: true,
      emailVerified: new Date(),
      credential: {
        create: {
          passwordHash: adminPasswordHash,
        },
      },
    },
  });

  // Ensure credential exists for existing user (if upsert update path was taken)
  // This is a bit manual but safe.
  const adminCred = await prisma.credential.findUnique({ where: { userId: superAdmin.id } });
  if (!adminCred) {
     await prisma.credential.create({
       data: {
         userId: superAdmin.id,
         passwordHash: adminPasswordHash
       }
     });
     console.log("✅ Credencial Super Admin recreada");
  }

  console.log("✅ Super Admin verificado/actualizado:", superAdmin.email);

  // Upsert TRADER
  const traderPasswordHash = await bcrypt.hash("Trader@2026!", 10);
  const traderUser = await prisma.user.upsert({
    where: { email: "trader@ittrade.com" },
    update: { isApproved: true, isActive: true, role: "trader" },
    create: {
      email: "trader@ittrade.com",
      name: "Usuario Trader",
      role: "trader",
      isApproved: true,
      isActive: true,
      emailVerified: new Date(),
      credential: { create: { passwordHash: traderPasswordHash } },
    },
  });

  const traderCred = await prisma.credential.findUnique({ where: { userId: traderUser.id } });
  if (!traderCred) {
     await prisma.credential.create({ data: { userId: traderUser.id, passwordHash: traderPasswordHash } });
  }
  console.log("✅ Usuario Trader verificado/actualizado:", traderUser.email);

  // Upsert USER
  const userPasswordHash = await bcrypt.hash("User@2026!", 10);
  const normalUser = await prisma.user.upsert({
    where: { email: "user@ittrade.com" },
    update: { isApproved: true, isActive: true, role: "user" },
    create: {
      email: "user@ittrade.com",
      name: "Usuario Estándar",
      role: "user",
      isApproved: true,
      isActive: true,
      emailVerified: new Date(),
      credential: { create: { passwordHash: userPasswordHash } },
    },
  });

  const userCred = await prisma.credential.findUnique({ where: { userId: normalUser.id } });
  if (!userCred) {
     await prisma.credential.create({ data: { userId: normalUser.id, passwordHash: userPasswordHash } });
  }
  console.log("✅ Usuario Normal verificado/actualizado:", normalUser.email);

  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
