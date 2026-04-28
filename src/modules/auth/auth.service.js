const { prisma }  = require("../../config/db");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const { handlePrismaError } = require("../../utils/handlePrismaError");
const crypto = require("crypto");
const { generateUniqueSlug } = require("../../utils/slug");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwt");
const { sendActivationEmail } = require("../../services/email/emailService")

// Función register
const register = async (data) => {
    try {
        
        const tenantSlug = await generateUniqueSlug(data.tenantName);

        const userEmail = await prisma.user.findUnique({
            where: { email: data.email }
        });
        if (userEmail) throw new CError(ErrorsIndex.CONFLICT, "Si los datos son correctos, recibirás un email de activación");

        const userUsername = await prisma.user.findUnique({
            where: { username: data.username }
        });
        if (userUsername) throw new CError(ErrorsIndex.CONFLICT, "Si los datos son correctos, recibirás un email de activación");

        const passwordHash = await hashPassword(data.password);

        const activationToken = crypto.randomBytes(32).toString("hex");

        const activationSentAt = new Date();

        const result = await prisma.$transaction(async (tx) => {
        
            const tenant = await tx.tenant.create({
                data: {
                    name: data.tenantName,
                    slug: tenantSlug,
                    isActive: true
                }
            });

            const user = await tx.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    nif: data.nif,
                    passwordHash,
                    activationToken,
                    activationSentAt,
                    isActive: false,
                    tenantId: tenant.id
                }
            });

            // Enviamos email de activación
            sendEmail = await sendActivationEmail(user.email, user.activationToken);

            return {
                tenant: {
                    id: tenant.id,
                    name: tenant.name,
                    slug: tenant.slug
            },
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    tenantId: user.tenantId,
                    isActive: user.isActive
                }
            };
        });
        
        return result;

    } catch(error) {
        handlePrismaError(error);
    }
}

// Función login
const login = async (email, password) => {

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if(!user) throw new CError(ErrorsIndex.BAD_INFO);
        if(!user.isActive) throw new CError(ErrorsIndex.UNAUTHORIZED, "El usuario no está activo");
        
        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if(!isPasswordValid) throw new CError(ErrorsIndex.BAD_INFO);

        const payload = {
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
            tokenVersion: user.tokenVersion
        }

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken({
            userId: user.id, 
            tokenVersion: user.tokenVersion,
        })

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                tenantId: user.tenantId
            }
        }

    } catch (error) {
        handlePrismaError(error);
    }

    
}

// Función logout
const logout = async () => {
    return { message: "Se ha cerrado sesión correctamente" };
}

// Función logout de todos los dispositivos
const logoutAll = async (userId) => {
    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                id: userId,
                tenantId,
                deletedAt: null
            }
        });

        if(!existingUser){
            if (!existingUser) throw new CError(ErrorsIndex.UNAUTHORIZED);
        }

        await prisma.user.update({
            where: { id: userId },
            data: {
                tokenVersion: { increment: 1 }
            }
        })

        return { message: "Se ha cerrado sesión en todos los dispositivos" }

    } catch (error) {
        handlePrismaError(error);
    }
}

// Función para refrescar el token en segundo plano
const refresh = async (token) => {
    try {
        const tokenPayload = verifyRefreshToken(token);

        const user = await prisma.user.findUnique({
                where: { id: tokenPayload.userId }
            });

        if(!user) throw new CError(ErrorsIndex.UNAUTHORIZED);
        if (tokenPayload.tokenVersion !== user.tokenVersion) throw new CError(ErrorsIndex.UNAUTHORIZED);
        if (!user.isActive) throw new CError(ErrorsIndex.UNAUTHORIZED);

        const newAccessToken = generateAccessToken({
            userId: user.id, 
            tenantId: user.tenantId,
            role: user.role,
            tokenVersion: user.tokenVersion,
        })

        return { accessToken: newAccessToken };

    } catch (error) {
        handlePrismaError(error);
    }

}

module.exports = {
    register,
    login,
    logout,
    logoutAll,
    refresh
};