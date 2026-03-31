const { prisma }  = require("../../config/db");

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
        console.error("Error en el servicio de crear tarea: ", error.message);
        throw error;
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
                const error = new Error("Tarea no encontrada");
                error.status = 404;
                throw error;
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
        console.error("Error en el servicio de actualizar tarea: ", error.message);
        throw error;
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
        console.error("Error en el servicio de recuperar tareas: ", error.message);
        throw error;
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
            const error = new Error("Tarea no encontrada");
            error.status = 404;
            throw error;
        }

        return result;
    } catch (error) {
        console.error("Error en el servicio de recuperar tarea: ", error.message);
        throw error;
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
                const error = new Error("Tarea no encontrada");
                error.status = 404;
                throw error;
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
        console.error("Error en el servicio de borrar tarea: ", error.message);
        throw error;
    }
}

module.exports = {
    createTask,
    updateTask,
    getAllTasks,
    getTaskById,
    deleteTask
}