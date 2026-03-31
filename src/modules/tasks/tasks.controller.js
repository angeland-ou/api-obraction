const { createTaskSchema, updateTaskSchema } = require("./tasks.validator");
const tasksService = require("./tasks.service");

const createTaskController = async (req, res, next) => {
    try {
        const result = createTaskSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                error: "Datos no válidos",
                // devolvemos los mensajes de los campos que fallaron 
                // configurados en el Schema de validación de Zod
                details: result.error.errors
            });
        }

        const newTask = await tasksService.createTask(req.params.projectId, req.tenant.tenantId, req.user.userId, result.data);

        res.status(201).json({
            message: "La tarea ha sido creado con éxito",
            data: newTask    
        })

    } catch (error) {
        next(error);
    }
}

const  updateTaskController = async (req, res, next) => {
    try {
        
        const result = updateTaskSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                error: "Datos no válidos",
                // devolvemos los mensajes de los campos que fallaron 
                // configurados en el Schema de validación de Zod
                details: result.error.errors
            });
        }

        const updatedTask = await tasksService.updateTask(req.params.id, req.params.projectId, req.tenant.tenantId, result.data);

        res.status(200).json({
            message: "La tarea ha sido actualizada con éxito",
            data: updatedTask
        });

    } catch (error) {
        next(error);
    }
}

const  getTaskByIdController = async (req, res, next) => {
    try {
        
        const task = await tasksService.getTaskById(req.params.id, req.params.projectId, req.tenant.tenantId);

        res.status(200).json({
            data: task
        })

    } catch (error) {
        next(error);
    }
}

const  getAllTasksController = async (req, res, next) => {
    try {
        
        const tasks = await tasksService.getAllTasks(req.params.projectId, req.tenant.tenantId);

        res.status(200).json({
            data: tasks
        })

    } catch (error) {
        next(error);
    }
}

const  deleteTaskController = async (req, res, next) => {
    try {
        
        await tasksService.deleteTask(req.params.id, req.params.projectId, req.tenant.tenantId)

        res.status(200).json({
            message: "La tarea ha sido borrado con éxito",
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    createTaskController,
    updateTaskController,
    getTaskByIdController,
    getAllTasksController,
    deleteTaskController
}