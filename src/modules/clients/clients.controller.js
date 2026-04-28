const { createClientSchema, updateClientSchema } = require("./clients.validator");
const clientsService = require("./clients.service");
const { CError, ErrorsIndex } = require("../../config/misc/errors");

const createClientController = async (req, res, next) => {
    try {
        const result = createClientSchema.safeParse(req.body);

        if(!result.success){
            return next(new CError(ErrorsIndex.VALIDATION_ERROR, result.error.issues));
        }

        const newClient = await clientsService.createClient(req.tenant.tenantId, req.user.userId, result.data);

        // si ha ido bien devolvemos status ok + mensaje y datos del cliente creado 
        // devueltos por el servicio de createClient
        res.status(201).json({
            success: true,
            message: "El cliente ha sido creado con éxito",
            data: newClient
        })
    } catch (error) {
        next(error);
    }
}

const getAllClientsController = async (req, res, next) => {
    try {
        const clients = await clientsService.getAllClients(req.tenant.tenantId);

        res.status(200).json({
            success: true,
            message: "Clientes cargados correctamente",
            data: clients
        })
    } catch (error) {
        next(error);
    }
}

const getClientByIdController = async (req, res, next) => {
    try {
        const client = await clientsService.getClientById(req.params.id, req.tenant.tenantId);

        res.status(200).json({
            success: true,
            message: "Cliente encontrado",
            data: client
        })
    } catch (error) {
        next(error);
    }
}

const updateClientController = async (req, res, next) => {
    try {
        const result = updateClientSchema.safeParse(req.body);

        if(!result.success){
            return next(new CError(ErrorsIndex.VALIDATION_ERROR, result.error.issues));
        }

        const data = { ...result.data, id: req.params.id };

        const updateClient = await clientsService.updateClient(req.tenant.tenantId, req.user.userId, data);
        
        res.status(200).json({
            success: true,
            message: "El cliente ha sido actualizado con éxito",
            data: updateClient
        });

    } catch (error) {
        next(error);
    }
}

const deleteClientController = async (req, res, next) => {

    try {
        
        await clientsService.deleteClient(req.tenant.tenantId, req.params.id);

        res.status(200).json({
            success: true,
            message: "El cliente ha sido borrado con éxito",
        });
        
    } catch (error) {
        next(error)
    }

}

module.exports = {
    createClientController,
    getAllClientsController,
    getClientByIdController,
    updateClientController,
    deleteClientController
}