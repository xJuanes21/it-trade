import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Verificar si ya existe el super admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@ittrade.com" },
  });

  if (!existingAdmin) {
    // Crear super admin
    const adminPasswordHash = await bcrypt.hash("Admin@2026!", 10);
    
    const superAdmin = await prisma.user.create({
      data: {
        email: "admin@ittrade.com",
        name: "Super Administrador",
        passwordHash: adminPasswordHash,
        role: "superadmin",
        emailVerified: new Date(),
      },
    });

    console.log("✅ Super Admin creado:", superAdmin.email);
  } else {
    console.log("ℹ️  Super Admin ya existe:", existingAdmin.email);
  }

  // Verificar si ya existe el usuario normal
  const existingUser = await prisma.user.findUnique({
    where: { email: "usuario@ittrade.com" },
  });

  if (!existingUser) {
    // Crear usuario normal de prueba
    const userPasswordHash = await bcrypt.hash("User@2026!", 10);
    
    const normalUser = await prisma.user.create({
      data: {
        email: "usuario@ittrade.com",
        name: "Usuario de Prueba",
        passwordHash: userPasswordHash,
        role: "user",
        emailVerified: new Date(),
      },
    });

    console.log("✅ Usuario normal creado:", normalUser.email);
  } else {
    console.log("ℹ️  Usuario normal ya existe:", existingUser.email);
  }

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
