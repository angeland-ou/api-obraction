const { prisma } = require("../config/db");
const { CError, ErrorsIndex } = require("../config/misc/errors");
const { handlePrismaError } = require("../utils/handlePrismaError");

const tenantHandler = async (req, res, next) => {

    try {
        
        const tenantId = req.user.tenantId;
    
        const tenant = await prisma.tenant.findUnique({
            where: {
                id: tenantId
            }
        })

        if (!tenant) throw new CError(ErrorsIndex.UNAUTHORIZED);

        if(!tenant.isActive) throw new CError(ErrorsIndex.UNAUTHORIZED);

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