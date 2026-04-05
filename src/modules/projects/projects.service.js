const { prisma } = require("../../config/db");

const createProject = async (tenantId, userId, data) => {
    try {
        const result = await prisma.project.create({
            data: {
                tenantId,
                createdById: userId,
                name: data.name,
                status: data.status || "pending",
                clientId: data.clientId || null,
                address: data.address || null,
                lat: data.lat || null,
                long: data.long || null,
                startDate: data.startDate || new Date(),
                endDate: data.endDate || null,
                notes: data.notes || null
            },
            select: {
                id: true,
                name: true,
                status: true,
                clientId: true,
                address: true,
                startDate: true,
                endDate: true,
                createdAt: true
            }
        });

        return result;

    } catch (error) {
        console.error("Error en el servicio de crear proyecto: ", error.message);
        throw error;
    }
};

const getAllProjects = async (tenantId) => {
    try {

        const projects = await prisma.project.findMany({
            where: {
                tenantId,
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                status: true,
                startDate: true
            }
        });

        // usamos la vista de la bbdd para recuperar datos
        const balances = await prisma.$queryRaw`
            SELECT 
                project_id,
                total_income,
                total_expenses,
                balance
            FROM v_project_balance
            WHERE tenant_id = ${tenantId}::uuid
        `;

        const result = projects.map(project => {
            const balance = balances.find(bal => bal.project_id === project.id);
            return {
                ...project,
                balance: {
                    totalIncome: balance ? Number(balance.total_income) : 0,
                    totalExpenses: balance ? Number(balance.total_expenses) : 0,
                    balance: balance ? Number(balance.balance) : 0
                }
            };
        });

        return result;

    } catch (error) {
        console.error("Error en el servicio de recuperar proyectos: ", error.message);
        throw error;
    }
};

const getAllProjectsStatus = async (tenantId, status) => {
    try {
        const result = await prisma.project.findMany({
            where: {
                tenantId,
                deletedAt: null,
                status: status
            },
            select: {
                id: true,
                name: true,
                status: true,
                client: {
                    where: {
                        deletedAt: null
                    },
                    select: {
                        id: true,
                        name: true
                    }
                },
                address: true,
                startDate: true,
                endDate: true,
                createdAt: true
            }
        });

        return result;

    } catch (error) {
        console.error("Error en el servicio de recuperar proyectos con status: ", error.message);
        throw error;
    }
};

const getProjectById = async (projectId, tenantId) => {
    try {
        const result = await prisma.project.findFirst({
            where: {
                id: projectId,
                tenantId,
                deletedAt: null
            },
            select: {
                id: true,
                name: true,
                status: true,
                clientId: true,
                address: true,
                lat: true,
                long: true,
                startDate: true,
                endDate: true,
                notes: true,
                createdAt: true,
                client: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        phones: {
                            where: { deletedAt: null },
                            select: {
                                id: true,
                                label: true,
                                number: true
                            }
                        }
                    }
                },
                tasks: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        dueDate: true,
                        createdAt: true
                    }
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
                },
                movements: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        type: true,
                        amount: true,
                        iva: true,
                        ivaAmount: true,
                        total: true,
                        concept: true,
                        movementDate: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!result) {
            const error = new Error("Proyecto no encontrado");
            error.status = 404;
            throw error;
        }

        return result;

    } catch (error) {
        console.error("Error en el servicio de recuperar proyecto: ", error.message);
        throw error;
    }
};

const getProjectByIdBasic = async (projectId, tenantId) => {
    try {
        const result = await prisma.project.findFirst({
            where: {
                id: projectId,
                tenantId,
                deletedAt: null
            },
            select: {
                id: true,
                name: true
            }
        });

        if (!result) {
            const error = new Error("Proyecto no encontrado");
            error.status = 404;
            throw error;
        }

        return result;

    } catch (error) {
        console.error("Error en el servicio de recuperar proyecto basic: ", error.message);
        throw error;
    }
}

const updateProject = async (projectId, tenantId, userId, data) => {
    try {
        const result = await prisma.$transaction(async (tx) => {

            const existingProject = await tx.project.findFirst({
                where: {
                    id: projectId,
                    tenantId,
                    deletedAt: null
                },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    clientId: true,
                    address: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true
                }
            });

            if (!existingProject) {
                const error = new Error("Proyecto no encontrado");
                error.status = 404;
                throw error;
            }

            const project = await tx.project.update({
                where: {
                    id: projectId,
                    tenantId,
                    deletedAt: null
                },
                data: {
                    name: data.name,
                    status: data.status,
                    clientId: data.clientId,
                    address: data.address,
                    lat: data.lat,
                    long: data.long,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    notes: data.notes,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    name: true,
                    status: true,
                    clientId: true,
                    address: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true
                }
            });

            return project;
        });

        return result;

    } catch (error) {
        console.error("Error en el servicio de actualizar proyecto: ", error.message);
        throw error;
    }
};

const deleteProject = async (projectId, tenantId) => {
    try {
        await prisma.$transaction(async (tx) => {

            const existingProject = await tx.project.findFirst({
                where: {
                    id: projectId,
                    tenantId,
                    deletedAt: null
                }
            });

            if (!existingProject) {
                const error = new Error("Proyecto no encontrado");
                error.status = 404;
                throw error;
            }

            await tx.project.update({
                where: {
                    id: projectId,
                    tenantId,
                    deletedAt: null
                },
                data: { deletedAt: new Date() }
            });

            // Soft delete en cascada de tareas, documentos y movimientos
            await tx.task.updateMany({
                where: { projectId, tenantId, deletedAt: null },
                data: { deletedAt: new Date() }
            });

            await tx.document.updateMany({
                where: { projectId, tenantId, deletedAt: null },
                data: { deletedAt: new Date() }
            });

            await tx.movement.updateMany({
                where: { projectId, tenantId, deletedAt: null },
                data: { deletedAt: new Date() }
            });

        });

        return { message: "Proyecto eliminado correctamente (junto con sus documentos, tareas y movimientos)" };

    } catch (error) {
        console.error("Error en el servicio de borrar proyecto: ", error.message);
        throw error;
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getAllProjectsStatus, // todos los proyectos con status determinado
    getProjectById, 
    getProjectByIdBasic, // id y nombre del proyecto
    updateProject,
    deleteProject
};