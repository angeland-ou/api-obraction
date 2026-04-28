const { prisma }  = require("../../config/db");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const { handlePrismaError } = require("../../utils/handlePrismaError");

const createTask = async (projectId, tenantId, userId, data) => {
    try {
        const result  = await prisma.task.create({
            data: {
                tenantId: tenantId,
                projectId: projectId,
                title: data.title,
                status: data.status,
                description: data.description,
                dueDate: data.dueDate,
                createdById: userId
            }
        });

        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const updateTask = async (taskId, projectId, tenantId, data) => {
    try {
        const result = await prisma.$transaction(async (tx) => {
            
            const existingTask = await tx.task.findFirst({
                where: {
                    id: taskId,
                    projectId: projectId,
                    tenantId: tenantId,
                    deletedAt: null
                }
            })

            if (!existingTask) {
                throw new CError(ErrorsIndex.NOT_FOUND, "Tarea no encontrada");
            }

            const task = await tx.task.update({
                where: {
                    id: taskId,
                    projectId: projectId,
                    tenantId: tenantId
                },
                data: {
                    title: data.title,
                    status: data.status,
                    description: data.description,
                    dueDate: data.dueDate,
                    updatedAt: new Date()
                },
                select: {
                    title: true,
                    status: true,
                    description: true,
                    dueDate: true,
                    createdAt: true
                }
            })

            return task;
        });

        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const getAllTasks = async (projectId, tenantId) => {
    try {
        const result = await prisma.task.findMany({
            where: {
                projectId,
                tenantId,
                deletedAt: null
            },
            select: {
                title: true,
                status: true,
                description: true,
                dueDate: true,
                createdAt: true
            }
        });

        // si no hay ninguno el result será []
        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const getTaskById = async (taskId, projectId, tenantId) => {
    try {
        const result = await prisma.task.findFirst({
            where: {
                id: taskId,
                projectId,
                tenantId,
                deletedAt: null
            },
            select: {
                title: true,
                status: true,
                description: true,
                dueDate: true,
                createdAt: true
            }
        });

        if (!result) {
            throw new CError(ErrorsIndex.NOT_FOUND, "Tarea no encontrada");
        }

        return result;

    } catch (error) {
        handlePrismaError(error);
    }
};

const deleteTask = async (taskId, projectId, tenantId) => {
    try {

        const result = await prisma.$transaction(async (tx) => {

            const existingTask = await tx.task.findFirst({
                where: {
                    id: taskId,
                    projectId,
                    tenantId,
                    deletedAt: null
                }
            })

            if (!existingTask) {
                throw new CError(ErrorsIndex.NOT_FOUND, "Tarea no encontrada");
            }

            await tx.task.update({
                where: { 
                    id: taskId,
                    projectId,
                    tenantId,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });

            return { message: "La tarea ha sido borrada con éxito" };

        });

        return result;
    
    }catch(error){
        handlePrismaError(error);
    }
}

module.exports = {
    createTask,
    updateTask,
    getAllTasks,
    getTaskById,
    deleteTask
}