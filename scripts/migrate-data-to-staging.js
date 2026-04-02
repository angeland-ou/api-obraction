const { PrismaClient } = require("../generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const dotenv = require("dotenv");

// Variables de entorno locales
dotenv.config({ path: ".env.local" });

// Cliente Prisma para BD local
const localAdapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const localDb = new PrismaClient({ adapter: localAdapter });

// Cliente Prisma para staging
const stagingUrl = process.env.STAGING_DATABASE_URL;
if (!stagingUrl) {
  console.error("❌ STAGING_DATABASE_URL no está definida");
  process.exit(1);
}

const stagingAdapter = new PrismaPg({
  connectionString: stagingUrl,
});
const stagingDb = new PrismaClient({ adapter: stagingAdapter });



// Orden de migración (respetando foreign keys)
const tablesOrder = [
  "Tenant",
  "User",
  "Client",
  "Project",
  "Phone",
  "Task",
  "Movement",
  "Document",
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

      // Insertar en staging
      for (const record of data) {
      // Eliminar columnas GENERATED (solo lectura)
      const { ivaAmount, total, ...recordWithoutGenerated } = record;
      
      await stagingDb[table].create({
        data: recordWithoutGenerated,
      });
}

      console.log(`---- ${table}: ${data.length} registros migrados\n`);
    }

    console.log("✅ Migración a Staging OK");
  } catch (error) {
    console.error("❌ Migración a Staging KO", error.message);
    process.exit(1);
  } finally {
    await localDb.$disconnect();
    await stagingDb.$disconnect();
  }
}

migrateData();