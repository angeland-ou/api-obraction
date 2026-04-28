const { prisma } = require("../../config/db");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const { handlePrismaError } = require("../../utils/handlePrismaError");
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
            throw new CError(ErrorsIndex.NOT_FOUND, "Documento no encontrado");
        }
 
        // Generamos URL firmada con 1 hora de caducidad
        const signedUrl = await getSignedUrl("documents", document.storagePath, 3600);
 
        return { url: signedUrl };
 
    } catch (error) {
        handlePrismaError(error);
    }
};

const deleteDocument = async (documentId, tenantId) => {
    try {
        const document = await prisma.document.findFirst({
            where: { id: documentId, tenantId, deletedAt: null }
        });

        if (!document) {
            throw new CError(ErrorsIndex.NOT_FOUND, "Documento no encontrado");
        }

        await deleteFile("documents", document.storagePath);

        await prisma.document.delete({
            where: { id: documentId }
        });

        return { message: "Documento eliminado con éxito" };
 
    } catch (error) {
        handlePrismaError(error);
    }
};

module.exports = { getDocumentSignedUrl, deleteDocument };
 
 