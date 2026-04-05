const { createProjectSchema, updateProjectSchema } = require("./projects.validator");
const projectsService = require("./projects.service");

const createProjectController = async (req, res, next) => {
    try {
        const result = createProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Datos no válidos",
                details: result.error.errors
            });
        }

        const newProject = await projectsService.createProject(
            req.tenant.tenantId,
            req.user.userId,
            result.data
        );

        res.status(201).json({
            message: "Proyecto creado con éxito",
            data: newProject
        });

    } catch (error) {
        next(error);
    }
};

const getAllProjectsController = async (req, res, next) => {
    try {
        const projects = await projectsService.getAllProjects(req.tenant.tenantId);

        res.status(200).json({ data: projects });

    } catch (error) {
        next(error);
    }
};

const getAllProjectsStatusController = async (req, res, next) => {
    try {
        const projects = await projectsService.getAllProjectsStatus(req.tenant.tenantId, req.params.status);

        res.status(200).json({ data: projects });

    } catch (error) {
        next(error);
    }
};

const getProjectByIdController = async (req, res, next) => {
    try {
        const project = await projectsService.getProjectById(req.params.id,req.tenant.tenantId);

        res.status(200).json({ data: project });

    } catch (error) {
        next(error);
    }
};

const getProjectByIdBasicController = async (req, res, next) => {
    try {
        const project = await projectsService.getProjectByIdBasic(req.params.id,req.tenant.tenantId);

        res.status(200).json({ data: project });

    } catch (error) {
        next(error);
    }
};

const updateProjectController = async (req, res, next) => {
    try {
        const result = updateProjectSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                error: "Datos no válidos",
                details: result.error.errors
            });
        }

        const updatedProject = await projectsService.updateProject(
            req.params.id,
            req.tenant.tenantId,
            req.user.userId,
            result.data);

        res.status(200).json({
            message: "Proyecto actualizado con éxito",
            data: updatedProject
        });

    } catch (error) {
        next(error);
    }
};

const deleteProjectController = async (req, res, next) => {
    try {
        await projectsService.deleteProject(req.params.id, req.tenant.tenantId);

        res.status(200).json({
            message: "Proyecto eliminado correctamente"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProjectController,
    getAllProjectsController,
    getAllProjectsStatusController,
    getProjectByIdController,
    getProjectByIdBasicController,
    updateProjectController,
    deleteProjectController
};