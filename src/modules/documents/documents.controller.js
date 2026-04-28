const documentsService = require("./documents.service");

const getDocumentUrlController = async (req, res, next) => {
    try {
        
        const result = await documentsService.getDocumentSignedUrl(
            req.params.id,
            req.tenant.tenantId
        );
        
        res.status(200).json({
            success: true,
            message: "Documento encontrado",
            data: result
        });

    } catch (error) {
        next(error);
    }
};

const deleteDocumentController = async (req, res, next) => {
    try {
        const result = await documentsService.deleteDocument(
            req.params.id,
            req.tenant.tenantId
        );
        res.status(200).json({
            success: true,
            message: "Documento eliminado correctamente",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDocumentUrlController, deleteDocumentController };