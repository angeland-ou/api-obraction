const { verifyAccessToken } = require("../utils/jwt");
const { prisma } = require("../config/db");
const { CError, ErrorsIndex } = require("../config/misc/errors");

const authHandler = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if(!accessToken) throw new CError(ErrorsIndex.UNAUTHORIZED, "Token inválido");

        const tokenVerify = verifyAccessToken(accessToken);

        const user = await prisma.user.findUnique({
            where: {
                id : tokenVerify.userId
            }
        })

        if(!user) throw new CError(ErrorsIndex.UNAUTHORIZED);
        if(!user.isActive) throw new CError(ErrorsIndex.UNAUTHORIZED);
        if(tokenVerify.tokenVersion !== user.tokenVersion) throw new CError(ErrorsIndex.UNAUTHORIZED);

        req.user = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            tokenVersion: user.tokenVersion
        }

        next();

    } catch (error) {
        next(error instanceof CError ? error : new CError(ErrorsIndex.UNAUTHORIZED));
    }
}

module.exports = authHandler;