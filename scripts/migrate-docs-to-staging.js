const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config({ path: ".env.local" });

// Obtener credenciales de Supabase STAGING
const stagingUrl = process.env.STAGING_SUPABASE_URL;
const stagingKey = process.env.STAGING_SUPABASE_KEY;

if (!stagingUrl || !stagingKey) {
  console.error("❌ STAGING_SUPABASE_URL o STAGING_SUPABASE_KEY no están definidas en .env.local");
  process.exit(1);
}

// Cliente Supabase STAGING
const supabase = createClient(stagingUrl, stagingKey);

// Ruta local donde están los documentos
const LOCAL_DOCUMENTS_PATH = "./documents-local";
const BUCKET_NAME = "documents";


// Mapeo de extensiones a MIME types
const mimeTypes = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".zip": "application/zip",
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || "application/octet-stream";
}

async function uploadFilesRecursive(dirPath, relativePath = "") {
  const files = fs.readdirSync(dirPath);
  let uploadedCount = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileStats = fs.statSync(filePath);

    if (fileStats.isDirectory()) {
      const newRelativePath = relativePath ? `${relativePath}/${file}` : file;
      uploadedCount += await uploadFilesRecursive(filePath, newRelativePath);
    } else if (fileStats.isFile()) {
      const storagePath = relativePath ? `${relativePath}/${file}` : file;
      const contentType = getMimeType(filePath);

      try {
        console.log(`-- Subiendo: ${storagePath}...`);
        const fileContent = fs.readFileSync(filePath);

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, fileContent, { 
            upsert: true,
            contentType: contentType
          });

        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
          continue;
        }

        console.log(`   ✅ Subido correctamente\n`);
        uploadedCount++;
      } catch (error) {
        console.error(`   ❌ Error al procesar ${storagePath}:`, error.message);
      }
    }
  }

  return uploadedCount;
}

async function uploadDocuments() {
  try {
    console.log("🚀 Iniciando carga de documentos a Staging...\n");

    if (!fs.existsSync(LOCAL_DOCUMENTS_PATH)) {
      console.log(`⚠️  La carpeta ${LOCAL_DOCUMENTS_PATH} no existe`);
      return;
    }

    const uploadedCount = await uploadFilesRecursive(LOCAL_DOCUMENTS_PATH);
    console.log(`✅ Carga completada: ${uploadedCount} archivos subidos`);
  } catch (error) {
    console.error("❌ Error en carga de documentos:", error.message);
    process.exit(1);
  }
}

uploadDocuments();