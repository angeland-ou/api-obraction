const { prisma } = require("../../config/db");
const { getSignedUrl, deleteFile } = require("../../services/storage/storageService");
 
const getDocumentSignedUrl = async (documentId, tenantId) => {
    try {
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                tenantId,
                deletedAt: null
            }
        });
 
        if (!document) {
            const error = new Error("Documento no encontrado");
            error.status = 404;
            throw error;
        }
 
        // Generamos URL firmada con 1 hora de caducidad
        const signedUrl = await getSignedUrl("documents", document.storagePath, 3600);
 
        return { url: signedUrl };
 
    } catch (error) {
        console.error("Error generando URL firmada:", error.message);
        throw error;
    }
};

const deleteDocument = async (documentId, tenantId) => {
    try {
        const document = await prisma.document.findFirst({
            where: { id: documentId, tenantId, deletedAt: null }
        });

        if (!document) {
            const error = new Error("Documento no encontrado");
            error.status = 404;
            throw error;
        }

        await deleteFile("documents", document.storagePath);

        await prisma.document.delete({
            where: { id: documentId }
        });

        return { message: "Documento eliminado con éxito" };

    } catch (error) {
        console.error("Error eliminando documento:", error.message);
        throw error;
    }
};

module.exports = { getDocumentSignedUrl, deleteDocument };
 
 