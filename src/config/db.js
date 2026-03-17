// Se importa el cliente de Prisma desde la carpeta que generará Prisma automáticamente
const { PrismaClient } = require("../../generated/prisma/client");

// Se importa el adaptador de Prisma para PostgreSQL (Prisma 7)
const { PrismaPg } = require("@prisma/adapter-pg");

// Se importa el pool de conexiones de PostgreSQL
const { Pool } = require("pg");

// Se importa la URL de conexión desde el archivo donde guardo variables de entorno
const { DATABASE_URL, DATABASE_NAME } = require("../config/misc/constants");

// Se crea el pool de conexiones con la URL de tu base de datos
const pool = new Pool({ connectionString: DATABASE_URL });

// Crea el adaptador pasándole el pool
const adapter = new PrismaPg(pool);

// Se crea la instancia de Prisma pasándole el adaptador
const prisma = new PrismaClient({ adapter });

const testDbConnection = async () => {
    try {
        // prueba de query mínima para verificar que la conexión funciona
        await prisma.$queryRaw`SELECT 1`;
        console.log(`✅ Test de conexión a la base de datos ${DATABASE_NAME} [OK]`);
    } catch (error) {
        console.log(`❌ Test de conexión a la base de datos  ${DATABASE_NAME} [KO]: `, error.message);
        process.exit(1);
    }
};

// Se exporta la instancia para usarla en toda la app
module.exports = { testDbConnection };