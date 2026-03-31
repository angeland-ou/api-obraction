const { prisma }  = require("../../config/db");

const createClient = async (tenantId, userId, data) => {

    try {
        const result = await prisma.$transaction(async (tx) => {
        
            const existingClient = await tx.client.findFirst({
                where: {
                    tenantId: tenantId,
                    email: data.email,
                    deletedAt: null
                }
            });

            if (existingClient) {
                const error = new Error("Ya existe un cliente registrado con este email");
                error.status = 409; // Código para conflicto
                throw error;
            }

            const client = await tx.client.create({
                data: {
                    tenantId: tenantId,
                    name: data.name,
                    surname: data.surname,
                    email: data.email,
                    nif: data.nif,
                    notes: data.notes,
                    createdById: userId
                }
            });

            if (data.phones && data.phones.length > 0) {
                for (const phone of data.phones) {
                    await tx.phone.create({
                        data: {
                            clientId: client.id,
                            tenantId,
                            label: phone.label,
                            number: phone.number,
                            createdById: userId
                        }
                    })
                }
            }
            
            const clientWithPhones = await tx.client.findFirst({
                where: { 
                    id: client.id,
                    tenantId,
                    deletedAt: null
                 },
                include: { phones: true }
            });

            return clientWithPhones;

        });

        return result;

    } catch (error) {
        console.error("Error en el servicio de crear cliente: ", error.message);
        throw error;
    }
};

const getAllClients = async (tenantId) => {
    try {
        const result = await prisma.client.findMany({
            where: {
                tenantId,
                deletedAt: null
            }, 
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                nif: true,
                notes: true,
                createdAt: true
            }
        });

        return result;

    } catch (error) {
        console.error("Error en el servicio de recuperar clientes: ", error.message);
        throw error;
    }
}

const getClientById = async (clientId, tenantId) => {
    try {
        const result = await prisma.client.findFirst({
            where: {
                id: clientId,
                tenantId,
                deletedAt: null
            }, 
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                nif: true,
                notes: true,
                createdAt: true,
                phones: {
                    select:{
                        label: true,
                        number: true
                    }
                }
            }
        });

        if (!result) {
            const error = new Error("Cliente no encontrado");
            error.status = 404;
            throw error;
        }

        return result;

    } catch (error) {
        console.error("Error en el servicio de recuperar cliente: ", error.message);
        throw error;
    }
}

const updateClient = async (tenantId, userId, data) => {
    try {

        const result = await prisma.$transaction(async (tx) => {

            const existingClient = await tx.client.findFirst({
                where: {
                    id: data.id,
                    tenantId,
                    deletedAt: null
                }
            })

            if (!existingClient) {
                const error = new Error("Cliente no encontrado");
                error.status = 404;
                throw error;
            }
        
            const client = await tx.client.update({
                where: {
                    id: data.id,
                    tenantId,
                    deletedAt: null
                },
                data: {
                    name: data.name,
                    surname: data.surname,
                    email: data.email,
                    nif: data.nif,
                    notes: data.notes,
                    updatedAt: new Date()
                }
            });

            await tx.phone.deleteMany({
                where: {
                    clientId: client.id,
                    tenantId,
                    deletedAt: null
                }
            })

            if (data.phones && data.phones.length > 0) {
                for (const phone of data.phones) {
                    await tx.phone.create({
                        data: {
                            clientId: client.id,
                            tenantId,
                            label: phone.label,
                            number: phone.number,
                            createdById: userId
                        }
                    })
                }
            }
            
            const clientWithPhones = await tx.client.findFirst({
                where: { 
                    id: client.id, 
                    tenantId,
                    deletedAt: null },
                include: { phones: true }
            });

            return clientWithPhones;

        });

        return result;

    }catch(error){
        console.error("Error en el servicio de actualizar cliente: ", error.message);
        throw error;
    }
}

const deleteClient = async (tenantId, clientId) => {
    try {

        const result = await prisma.$transaction(async (tx) => {

            const existingClient = await tx.client.findFirst({
                where: {
                    id: clientId,
                    tenantId,
                    deletedAt: null
                }
            })

            if (!existingClient) {
                const error = new Error("Cliente no encontrado");
                error.status = 404;
                throw error;
            }

            await tx.client.update({
                where: { 
                    id: clientId,
                    tenantId,
                    deletedAt: null
                },
                data: {
                    deletedAt: new Date()
                }
            });

            await tx.phone.updateMany({
                where: { 
                    clientId: clientId,
                    tenantId,
                    deletedAt: null
                },
                data:{
                    deletedAt: new Date()
                }
            })

            return { message: "El cliente ha sido borrado con éxito" };

        });

        return result;
    
    }catch(error){
        console.error("Error en el servicio de borrar un cliente: ", error.message);
        throw error;
    }
}

module.exports = {
    createClient,
    getAllClients, 
    getClientById, 
    updateClient,
    deleteClient
}