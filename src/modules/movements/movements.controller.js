const movementsService = require("./movements.service");
const { createMovementSchema, updateMovementSchema } = require("./movements.validator");
const { CError, ErrorsIndex } = require("../../config/misc/errors");

const createMovementController = async (req, res, next) => {

        try {
            const result = createMovementSchema.safeParse(req.body);

            if (!result.success) {
                return next(new CError(ErrorsIndex.VALIDATION_ERROR, result.error.issues));
            }

            const newMovement = await movementsService.createMovement(
                req.tenant.tenantId,
                req.user.userId,
                result.data,
                req.file || null
            );

            res.status(201).json({
                success: true,
                message: "Movimiento registrado con éxito",
                data: newMovement
            });

        } catch (error) {
            next(error);
        }
};

const getAllMovementsController = async (req, res, next) => {
    try {

        // filtramos por proyecto si viene en la URL (?projectId=)
        const { projectId } = req.query;

        const movements = await movementsService.getAllMovements(req.tenant.tenantId, projectId);

        res.status(200).json({
            success: true,
            message: "Movimientos encontrados",
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
            success: true,
            message: "Documento encontrado",
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
                return next(new CError(ErrorsIndex.VALIDATION_ERROR, result.error.issues));
            }

            const updated = await movementsService.updateMovement(
                req.params.id,
                req.tenant.tenantId,
                req.user.userId,
                result.data,
                req.file || null
            );

            res.status(200).json({ 
                success: true,
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

        res.status(200).json({
            success: true,
            message: "Movimiento borrado con éxito",
            data: response
        });
        
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