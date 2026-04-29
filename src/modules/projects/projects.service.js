const { prisma } = require("../../config/db");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const { handlePrismaError } = require("../../utils/handlePrismaError");

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
                lat: data.lat ?? null,
                long: data.long ?? null,
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
        handlePrismaError(error);
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

        // usamos las vistas de la bbdd para recuperar datos
        const balances = await prisma.$queryRaw`
            SELECT 
                project_id,
                total_income,
                total_expenses,
                balance
            FROM v_project_balance
            WHERE tenant_id = ${tenantId}::uuid
        `;

        const incomes = await prisma.$queryRaw`
            SELECT 
                project_id,
                total_amount,
                total_iva,
                total_with_iva
            FROM v_project_income
            WHERE tenant_id = ${tenantId}::uuid
        `;

        const expenses = await prisma.$queryRaw`
            SELECT 
                project_id,
                total_amount,
                total_iva,
                total_with_iva
            FROM v_project_expenses
            WHERE tenant_id = ${tenantId}::uuid
        `;

        const result = projects.map(project => {
            const balance = balances.find(bal => bal.project_id === project.id);
            const income = incomes.find(inc => inc.project_id === project.id);
            const expense = expenses.find(exp => exp.project_id === project.id);
            return {
                ...project,
                balance: {
                    totalIncome: balance ? Number(balance.total_income) : 0,
                    totalExpenses: balance ? Number(balance.total_expenses) : 0,
                    balance: balance ? Number(balance.balance) : 0
                },
                income: {
                    totalAmount: income ? Number(income.total_amount) : 0,
                    totalIva: income ? Number(income.total_iva) : 0,
                    totalWithIva: income ? Number(income.total_with_iva) : 0,
                },
                expense: {
                    totalAmount: expense ? Number(expense.total_amount) : 0,
                    totalIva: expense ? Number(expense.total_iva) : 0,
                    totalWithIva: expense ? Number(expense.total_with_iva) : 0,
                }
            };
        });

        return result;

    } catch (error) {
        handlePrismaError(error);
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
        handlePrismaError(error);
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
            throw new CError(ErrorsIndex.NOT_FOUND, "Proyecto no encontrado");
        }

         const balances = await prisma.$queryRaw`
            SELECT 
                project_id,
                total_income,
                total_expenses,
                balance
            FROM v_project_balance
            WHERE tenant_id = ${tenantId}::uuid
            AND project_id = ${projectId}::uuid
        `;

        const incomes = await prisma.$queryRaw`
            SELECT 
                project_id,
                total_amount,
                total_iva,
                total_with_iva
            FROM v_project_income
            WHERE tenant_id = ${tenantId}::uuid
            AND project_id = ${projectId}::uuid
        `;

        const expenses = await prisma.$queryRaw`
            SELECT 
                project_id,
                total_amount,
                total_iva,
                total_with_iva
            FROM v_project_expenses
            WHERE tenant_id = ${tenantId}::uuid
            AND project_id = ${projectId}::uuid
        `;

        const balance = balances.find(bal => bal.project_id === projectId);
        const income = incomes.find(inc => inc.project_id === projectId);
        const expense = expenses.find(exp => exp.project_id === projectId);
        
        const results = {
                ...result,
                balance: {
                    totalIncome: balance ? Number(balance.total_income) : 0,
                    totalExpenses: balance ? Number(balance.total_expenses) : 0,
                    balance: balance ? Number(balance.balance) : 0
                },
                income: {
                    totalAmount: income ? Number(income.total_amount) : 0,
                    totalIva: income ? Number(income.total_iva) : 0,
                    totalWithIva: income ? Number(income.total_with_iva) : 0,
                },
                expense: {
                    totalAmount: expense ? Number(expense.total_amount) : 0,
                    totalIva: expense ? Number(expense.total_iva) : 0,
                    totalWithIva: expense ? Number(expense.total_with_iva) : 0,
                }
            }

        return results;

    } catch (error) {
        handlePrismaError(error);
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
            throw new CError(ErrorsIndex.NOT_FOUND, "Proyecto no encontrado");
        }

        return result;

    } catch (error) {
        handlePrismaError(error);
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
                throw new CError(ErrorsIndex.NOT_FOUND, "Proyecto no encontrado");
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
        handlePrismaError(error);
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
                throw new CError(ErrorsIndex.NOT_FOUND, "Proyecto no encontrado");
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
        handlePrismaError(error);
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