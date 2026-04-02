const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

// Obtener credenciales de Supabase PROD
const prodUrl = process.env.PROD_SUPABASE_URL;
const prodKey = process.env.PROD_SUPABASE_KEY;

if (!prodUrl || !prodKey) {
  console.error("❌ PROD_SUPABASE_URL o PROD_SUPABASE_KEY no están definidas en .env.local");
  process.exit(1);
}

// Cliente Supabase PROD
const supabase = createClient(prodUrl, prodKey);

// Ruta local donde están los documentos en Docker
const LOCAL_DOCUMENTS_PATH = "/var/lib/docker/volumes/supabase_storage_easyobra/_data/documents";
const BUCKET_NAME = "documents";

async function uploadDocuments() {
  try {
    console.log("🚀 Iniciando carga de documentos a Production...\n");

    // Verificar que existe la carpeta local
    if (!fs.existsSync(LOCAL_DOCUMENTS_PATH)) {
      console.log(`⚠️ La carpeta ${LOCAL_DOCUMENTS_PATH} no existe`);
      console.log(" Asegúrate de tener los archivos en esa ubicación\n");
      return;
    }

    // Leer archivos de la carpeta local
    const files = fs.readdirSync(LOCAL_DOCUMENTS_PATH);

    if (files.length === 0) {
      console.log(">> No hay documentos para subir\n");
      return;
    }

    console.log(`-- Encontrados ${files.length} archivos\n`);

    let uploadedCount = 0;

    for (const file of files) {
      const filePath = path.join(LOCAL_DOCUMENTS_PATH, file);
      const fileStats = fs.statSync(filePath);

      // Solo procesar archivos, no carpetas
      if (!fileStats.isFile()) {
        continue;
      }

      try {
        console.log(`-- Subiendo: ${file}...`);

        // Leer el archivo
        const fileContent = fs.readFileSync(filePath);

        // Subir a Supabase Storage PROD
        const { data, error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(file, fileContent, {
            upsert: true,
          });

        if (error) {
          console.error(`❌ Error: ${error.message}`);
          continue;
        }

        console.log(`✅ Subido correctamente\n`);
        uploadedCount++;
      } catch (error) {
        console.error(`❌ Error al procesar ${file}:`, error.message);
      }
    }

    console.log(`✅ Carga de documentos completada: ${uploadedCount}/${files.length} archivos subidos`);
  } catch (error) {
    console.error("❌ Error en carga de documentos:", error.message);
    process.exit(1);
  }
}

uploadDocuments();