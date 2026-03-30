const { createClientSchema, updateClientSchema } = require("./clients.validator");
const clientsService = require("./clients.service");

const createClientController = async (req, res, next) => {
    try {
        // console.log("Body recibido:", req.body); 
        const result = createClientSchema.safeParse(req.body);
        // console.log("Resultado validación:", result);

        if(!result.success){
            return res.status(400).json({
                error: "Datos no válidos",
                // devolvemos los mensajes de los campos que fallaron 
                // los que configuramos en el Schema de validación de Zod
                details: result.error.errors
            });
        }

        const newClient = await clientsService.createClient(req.tenant.tenantId, req.user.userId, result.data);

        // si ha ido bien devolvemos status ok + mensaje y datos del cliente creado 
        // devueltos por el servicio de createClient
        res.status(201).json({
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
            return res.status(400).json({
                error: "Datos no válidos",
                // devolvemos los mensajes de los campos que fallaron 
                // los que configuramos en el Schema de validación de Zod
                details: result.error.errors
            });
        }

        const data = { ...result.data, id: req.params.id };

        const updateClient = await clientsService.updateClient(req.tenant.tenantId, req.user.userId, data);
        
        res.status(200).json({
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