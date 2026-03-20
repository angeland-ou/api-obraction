const { prisma }  = require("../../config/db");
const crypto = require("crypto");
const { generateUniqueSlug } = require("../../utils/slug");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../../utils/jwt");


// Función register
const register = async (username, email, password, nif, tenantName) => {
    try {
        
        const tenantSlug = await generateUniqueSlug(tenantName);

        const userEmail = await prisma.user.findUnique({
            where: { email }
        });
        if (userEmail) {
            const error = new Error("El email ya está registrado");
            error.status = 409;
            throw error;
        }

        const userUsername = await prisma.user.findUnique({
            where: { username }
        });
        if (userUsername) {
            const error = new Error("Ese nombre de usuario ya está registrado");
            error.status = 409;
            throw error;
        }

        const passwordHash = await hashPassword(password);

        const activationToken = crypto.randomBytes(32).toString("hex");

        const activationSentAt = new Date();

        const result = await prisma.$transaction(async (tx) => {
        
            const tenant = await tx.tenant.create({
                data: {
                    name: tenantName,
                    slug: tenantSlug,
                    isActive: true
                }
            });

            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    nif,
                    passwordHash,
                    activationToken,
                    activationSentAt,
                    isActive: false,
                    tenantId: tenant.id
                }
            });

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
        console.error("Error en el servicio de auth register: ", error.message);
        throw error;
    }
}

// Función login
const login = async (email, password) => {

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })
        if(!user){
            const error = new Error("El email o la contraseña son incorrectos");
            error.status = 401;
            throw error;
        }
        if(!user.isActive){
            const error = new Error("El usuario no está activo, por favor revisa tu email");
            error.status = 401;
            throw error;
        }
        
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if(!isPasswordValid){
            const error = new Error("El email o la contraseña son incorrectos");
            error.status = 401;
            throw error;
        }

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
        console.error("Error en el servicio de auth login: ", error.message);
        throw error;
    }

    
}

// Función logout
const logout = async () => {
    return { message: "Se ha cerrado sesión correctamente" };
}

// Función logout de todos los dispositivos
const logoutAll = async (userId) => {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                tokenVersion: { increment: 1 }
            }
        })

        return { message: "Se ha cerrado sesión en todos los dispositivos" }

    } catch (error) {
        console.error("Error al cerrar sesión en todos los dispositivos: ", error.message);
        throw error;
    }
}

// Función para refrescar el token en segundo plano
const refresh = async (token) => {
    try {
        const tokenPayload = verifyRefreshToken(token);

        const user = await prisma.user.findUnique({
                where: { id: tokenPayload.userId }
            });

        if(!user) {
            const error = new Error("El usuario no existe");
            error.status = 401;
            throw error;
        }

        if (tokenPayload.tokenVersion !== user.tokenVersion){
            const error = new Error("El usuario debe iniciar sesión de nuevo");
            error.status = 401;
            throw error;
        }

        if (!user.isActive){
            const error = new Error("El usuario no está activo, por favor revisa tu email o ponte en contacto con el administrador de la aplicación");
            error.status = 401;
            throw error;
        }

        const newAccessToken = generateAccessToken({
            userId: user.id, 
            tenantId: user.tenantId,
            role: user.role,
            tokenVersion: user.tokenVersion,
        })

        return { accessToken: newAccessToken };
        

    } catch (error) {
        console.error("Error en el servicio de auth refresh: ", error.message);
        throw error;
    }

}

module.exports = {
    register,
    login,
    logout,
    logoutAll,
    refresh
};