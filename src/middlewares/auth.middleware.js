const { verifyAccessToken } = require("../utils/jwt");
const { prisma } = require("../config/db");

const authHandler = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if(!accessToken) {
            return res.status(401).json({
                error: "No existe la cookie"
            })
        }

        const tokenVerify = verifyAccessToken(accessToken);

        const user = await prisma.user.findUnique({
            where: {
                id : tokenVerify.userId
            }
        })

        if(!user){
            return res.status(401).json({
                error: "El usuario no existe"
            })
        }

        const isActive = user.isActive;

        if(!isActive){
            return res.status(401).json({
                error: "El usuario no está activo"
            })
        }

        if(tokenVerify.tokenVersion !== user.tokenVersion){
            return res.status(401).json({
                error: "El token ha expirado"
            })
        }

        req.user = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            tokenVersion: user.tokenVersion
        }

        next();

    } catch (error) {
        next(error)
    }
}

module.exports = authHandler;