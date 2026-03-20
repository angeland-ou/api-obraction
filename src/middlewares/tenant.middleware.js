const { prisma } = require("../config/db");

const tenantHandler = async (req, res, next) => {

    try {
        
        const tenantId = req.user.tenantId;
    
        const tenant = await prisma.tenant.findUnique({
            where: {
                id: tenantId
            }
        })

        if (!tenant){
            return res.status(401).json({
                error: "La empresa no existe"
            })
        }

        if(!tenant.isActive){
            return res.status(401).json({
                error: "La empresa no está activa"
            })
        }

        req.tenant = {
            tenantId: tenant.id,
            name: tenant.name,
            slug: tenant.slug
        }

        next()

    } catch (error) {
        next(error);
    }

    
}

module.exports = tenantHandler;