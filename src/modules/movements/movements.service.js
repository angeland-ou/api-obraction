const { prisma } = require("../../config/db");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const { handlePrismaError } = require("../../utils/handlePrismaError");
const { uploadFile, deleteFile } = require("../../services/storage/storageService");

const createMovement = async (tenantId, userId, data, file = null) => {
    try {
        const result = await prisma.$transaction(async (tx) => {

            const movement = await tx.movement.create({
                data: {
                    tenantId,
                    projectId: data.projectId || null,
                    amount: data.amount,
                    iva: data.iva,
                    type: data.type,
                    concept: data.concept,
                    notes: data.notes,
                    movementDate: data.movementDate,
                    createdById: userId
                }
            });

            // Si hay archivo lo subimos a Supabase Storage
            if (file) {
                const ext = file.mimetype === "application/pdf" ? "pdf" : "jpg";
                const storagePath = `${tenantId}/movements/${movement.id}.${ext}`;

                await uploadFile("documents", storagePath, file.buffer, file.mimetype);

                await tx.document.create({
                    data: {
                        tenantId,
                        movementId: movement.id,
                        createdById: userId,
                        mimeType: file.mimetype,
                        originalName: file.originalname,
                        storagePath,
                        sizeBytes: file.size
                    }
                });
            }

            const movementWithDocument = await tx.movement.findFirst({
                where: { id: movement.id },
                include: {
                    documents: {
                        where: { deletedAt: null },
                        select: {
                            id: true,
                            originalName: true,
                            mimeType: true,
                            sizeBytes: true,
                            storagePath: true,
                            createdAt: true
                        }
                    }
                }
            });

            return movementWithDocument;
        });

        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const getAllMovements = async (tenantId, projectId = null) => {
    try {
        const where = {
            tenantId,
            deletedAt: null
        };

        // Si el usuario envía un projectId en la petición, filtramos por projectId
        if (projectId) {
            where.projectId = projectId;
        }

        const result = await prisma.movement.findMany({
            where,
            orderBy: { movementDate: 'desc' },
            include: {
                project: {
                    select: { name: true } // Mostramos info del proyecto si existe
                },
                documents: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        originalName: true,
                        mimeType: true,
                        sizeBytes: true,
                        storagePath: true,
                        createdAt: true
                    }
                }
            }
        });

        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const getMovementById = async (id, tenantId) => {
    try {
        const result = await prisma.movement.findFirst({
            where: {
                id, 
                tenantId, 
                deletedAt: null
            },
            include: {
                project: {
                    select: { name: true }
                },
                documents: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        originalName: true,
                        mimeType: true,
                        sizeBytes: true,
                        storagePath: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!result) {
            throw new CError(ErrorsIndex.NOT_FOUND, "Movimiento no encontrado");
        }

        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const updateMovement = async (id, tenantId, userId, data, file = null) => {
    try {
        // verificamos que existe
        await getMovementById(id, tenantId);

        // si hay archivo nuevo lo subimos
        if (file) {
            const ext = file.mimetype === "application/pdf" ? "pdf" : "jpg";
            const storagePath = `${tenantId}/movements/${id}.${ext}`;

            await uploadFile("documents", storagePath, file.buffer, file.mimetype, true);

            // buscamos si ya había documento para actualizarlo o crear uno nuevo
            const existing = await prisma.document.findFirst({
                where: { movementId: id, tenantId, deletedAt: null }
            });

            if (existing) {
                await prisma.document.update({
                    where: { id: existing.id },
                    data: {
                        mimeType: file.mimetype,
                        originalName: file.originalname,
                        storagePath,
                        sizeBytes: file.size,
                        updatedAt: new Date()
                    }
                });
            } else {
                await prisma.document.create({
                    data: {
                        tenantId,
                        movementId: id,
                        createdById: userId,
                        mimeType: file.mimetype,
                        originalName: file.originalname,
                        storagePath,
                        sizeBytes: file.size
                    }
                });
            }
        }

        const result = await prisma.movement.update({
            where: { id },
            data: { ...data, updatedAt: new Date() },
            include: {
                project: { select: { name: true } },
                documents: {
                    where: { deletedAt: null },
                    select: {
                        id: true, originalName: true, mimeType: true,
                        sizeBytes: true, storagePath: true, createdAt: true
                    }
                }
            }
        });

        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const deleteMovement = async (id, tenantId) => {
    try {
        await prisma.$transaction(async (tx) => {

            const existingMovement = await tx.movement.findFirst({
                where: { id, tenantId, deletedAt: null },
                include: {
                    documents: {
                        where: { deletedAt: null }
                    }
                }
            });

            if (!existingMovement) {
                throw new CError(ErrorsIndex.NOT_FOUND, "Movimiento no encontrado");
            }

            // borramos archivos del storage para liberar el espacio y registros de la bbdd
            for (const doc of existingMovement.documents) {
                await deleteFile("documents", doc.storagePath);
                await tx.document.delete({
                    where: { id: doc.id }
                });
            }

            // hacemos un soft delete del movimiento
            await tx.movement.update({
                where: { id, tenantId, deletedAt: null },
                data: { deletedAt: new Date() }
            });
        });

        return { message: "Movimiento eliminado con éxito" };

    } catch (error) {
        handlePrismaError(error);
    }
};

module.exports = {
    createMovement,
    getAllMovements,
    getMovementById,
    updateMovement,
    deleteMovement
};