const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

// Variables de entorno locales
dotenv.config({ path: ".env.local" });

// Cliente Prisma para BD local
const localDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Cliente Prisma para supabase production
const prodUrl = process.env.PRODUCTION_DATABASE_URL;
if (!prodUrl) {
  console.error(
    "❌ PRODUCTION_DATABASE_URL no está definida en .env.local"
  );
  process.exit(1);
}

const prodDb = new PrismaClient({
  datasources: {
    db: {
      url: prodUrl,
    },
  },
});

// Orden de migración (respetando foreign keys)
const tablesOrder = [
  "tenants",
  "users",
  "clients",
  "projects",
  "phones",
  "tasks",
  "movements",
  "documents",
];

async function migrateData() {
  try {
    console.log("🚀 Iniciando migración de datos...\n");

    for (const table of tablesOrder) {
      console.log(`-- Migrando tabla: ${table}...`);

      // Obtener datos de local
      const data = await localDb[table].findMany();

      if (data.length === 0) {
        console.log(`>> ${table} está vacía, saltando...\n`);
        continue;
      }

      // Insertar en prod
      for (const record of data) {
        await prodDb[table].create({
          data: record,
        });
      }

      console.log(`---- ${table}: ${data.length} registros migrados\n`);
    }

    console.log("✅ Migración a Production OK");
  } catch (error) {
    console.error("❌ Migración a Production KO", error.message);
    process.exit(1);
  } finally {
    await localDb.$disconnect();
    await prodDb.$disconnect();
  }
}

migrateData();