const movementsService = require("./movements.service");
const { createMovementSchema, updateMovementSchema } = require("./movements.validator");
const upload = require("../../config/multer");

const createMovementController = async (req, res, next) => {
    
    upload.single("file")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        try {
            const result = createMovementSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    error: "Datos no válidos",
                    details: result.error.errors
                });
            }

            const newMovement = await movementsService.createMovement(
                req.tenant.tenantId,
                req.user.userId,
                result.data,
                req.file || null // archivo opcional
            );

            res.status(201).json({
                message: "Movimiento registrado con éxito",
                data: newMovement
            });

        } catch (error) {
            next(error);
        }
    });
};

const getAllMovementsController = async (req, res, next) => {
    try {

        // filtramos por proyecto si viene en la URL (?projectId=)
        const { projectId } = req.query;

        const movements = await movementsService.getAllMovements(req.tenant.tenantId, projectId);

        res.status(200).json({
            data: movements
        });

    } catch (error) {
        next(error);
    }
};

const getMovementByIdController = async (req, res, next) => {
    try {

        const movement = await movementsService.getMovementById(req.params.id, req.tenant.tenantId);

        res.status(200).json({
            data: movement
        });

    } catch (error) {
        next(error);
    }
};

const updateMovementController = async (req, res, next) => {
    try {
        const result = updateMovementSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ error: "Datos no válidos", details: result.error.errors });
        }

        const updated = await movementsService.updateMovement(req.params.id, req.tenant.tenantId, result.data);

        res.status(200).json({
            message: "Movimiento actualizado",
            data: updated
        });

    } catch (error) {
        next(error);
    }
};

const deleteMovementController = async (req, res, next) => {
    try {

        const response = await movementsService.deleteMovement(req.params.id, req.tenant.tenantId);

        res.status(200).json(response);
        
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createMovementController,
    getAllMovementsController,
    getMovementByIdController,
    updateMovementController,
    deleteMovementController
};