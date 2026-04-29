const { prisma }  = require("../../config/db");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const { handlePrismaError } = require("../../utils/handlePrismaError");

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
                throw new CError(ErrorsIndex.CONFLICT, "Ya existe un cliente con ese email");
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
        handlePrismaError(error);
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
                createdAt: true,
                phones: {
                    select:{
                        number: true
                    }
                }
            }
        });

        return result;

    } catch (error) {
        handlePrismaError(error);
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
            throw new CError(ErrorsIndex.NOT_FOUND, "Cliente no encontrado");
        }

        return result;

    } catch (error) {
        handlePrismaError(error);
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
              throw new CError(ErrorsIndex.NOT_FOUND, "Cliente no encontrado");
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
        handlePrismaError(error);
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
                throw new CError(ErrorsIndex.NOT_FOUND, "Cliente no encontrado");
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
        handlePrismaError(error)
    }
}

module.exports = {
    createClient,
    getAllClients, 
    getClientById, 
    updateClient,
    deleteClient
}