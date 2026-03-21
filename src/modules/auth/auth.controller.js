const { registerSchema, loginSchema } = require("./auth.validator");
const authService = require("./auth.service");
const { JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, NODE_ENV, COOKIE_DOMAIN } = require("../../config/misc/constants");
const { prisma } = require("../../config/db");
const ms = require('ms');

// Controller del registro
const registerController = async (req, res, next) => {
    try {
        // Validamos con Zod
        const result = registerSchema.safeParse(req.body);
        
        if(!result.success) {
            return res.status(400).json({
                error: "Datos no válidos",
                details: result.error.errors
           });
        }

        const { username, email, password, nif, tenantName } = result.data;

        // Si ha ido bien, llamamos al service de registro de usuario
        const data = await authService.register(username, email, password, nif, tenantName);
        
        // Devuelvo status Ok + datos devueltos por el servicio de registro (tenant, user)
        res.status(201).json({
            message: "Usuario registrado correctamente, revisa tu email para activar tu cuenta",
            data
        });

    } catch (error) {
        // pasamos el error al errorHandler
        next(error);
    }
}

const loginController = async (req, res, next) => {
    try {
        // Validamos con Zod
        const result = loginSchema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                error: "Datos no válidos",
                details: result.error.errors
            })
        }

        const { email, password } = result.data;

        const data = await authService.login(email, password);
        
        res
        .cookie('accessToken', data.accessToken, {
            httpOnly: true,
            domain: COOKIE_DOMAIN,
            secure: NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: ms(JWT_EXPIRES_IN)
        })
        .cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            domain: COOKIE_DOMAIN,
            secure: NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: ms(JWT_REFRESH_EXPIRES_IN)
        })
        .status(200).json({
            message: "Usuario conectado correctamente",
            user: data.user
        })
    } catch (error) {
        next(error);
    }
}

const logoutController = async (req, res, next) => {

    try {

        const data = await authService.logout();

        res.clearCookie('accessToken', {
            httpOnly: true,
            domain: COOKIE_DOMAIN || undefined,
            secure: NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            domain: COOKIE_DOMAIN || undefined,
            secure: NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            message: "Usuario desconectado correctamente"
        })

    } catch (error) {
        next(error);
    }

}

const logoutAllController = async (req, res, next) => {

    try {

        const { userId } = req.user;

        const data = await authService.logoutAll(userId);

        res.clearCookie('accessToken', {
            httpOnly: true,
            domain: COOKIE_DOMAIN || undefined,
            secure: NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            domain: COOKIE_DOMAIN || undefined,
            secure: NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            message: "Usuario desconectado correctamente de todos los dispositivos"
        })

    } catch (error) {
        next(error);
    }
}

const refreshController = async (req, res, next) => {
    
   try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                error: "No se ha encontrado la cookie"
            })
        }
        
        const data = await authService.refresh(refreshToken);

        res.cookie('accessToken', data.accessToken, {
                httpOnly: true,
                domain: COOKIE_DOMAIN,
                secure: NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: ms(JWT_EXPIRES_IN)
            })
            .status(200).json({
                message: "Token regenerado correctamente"
            })
   } catch (error) {
        next(error);
   }
}

const meController = async (req, res, next) => {
    try {
        const { userId } = req.user;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                tenantId: true,
                isActive: true
            }
        });

        if(!user) {
            return res.status(401).json({
                error: "El usuario no existe"
            })
        }

        res.status(200).json({ user });

    } catch (error) {
        next(error);
    }

}

module.exports = {
    registerController,
    loginController,
    logoutController,
    logoutAllController,
    refreshController,
    meController
}