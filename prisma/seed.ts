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
        role: "user",
        isApproved: true, // Usuario de prueba aprobado por defecto
        emailVerified: new Date(),
        credential: {
          create: {
            passwordHash: userPasswordHash,
          },
        },
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
