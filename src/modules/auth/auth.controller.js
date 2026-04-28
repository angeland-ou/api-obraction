const { registerSchema, loginSchema } = require("./auth.validator");
const { CError, ErrorsIndex } = require("../../config/misc/errors");
const authService = require("./auth.service");
const { JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, NODE_ENV, COOKIE_DOMAIN } = require("../../config/misc/constants");
const { prisma } = require("../../config/db");
const ms = require('ms');

// Controller del registro
const registerController = async (req, res, next) => {
    try {
        // Validamos con Zod
        const result = registerSchema.safeParse(req.body);
        
        if(!result.success) return next(new CError(ErrorsIndex.VALIDATION_ERROR, result.error.issues));

        // Si ha ido bien, llamamos al service de registro de usuario
        const data = await authService.register(result.data);
        
        // Devuelvo status Ok + datos devueltos por el servicio de registro (tenant, user)
        res.status(201).json({
            success: true, 
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
            return next(new CError(ErrorsIndex.VALIDATION_ERROR, result.error.issues));
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
            success: true,
            message: "Usuario conectado correctamente",
            data: { user: data.user }
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
            success: true,
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
            success: true,
            message: "Usuario desconectado correctamente de todos los dispositivos"
        })

    } catch (error) {
        next(error);
    }
}

const refreshController = async (req, res, next) => {
    
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) return next(new CError(ErrorsIndex.UNAUTHORIZED));
        
        const data = await authService.refresh(refreshToken);

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('accessToken', data.accessToken, {
                httpOnly: true,
                domain: COOKIE_DOMAIN,
                secure: isProduction,
                sameSite: isProduction ? 'lax' : 'strict',
                path: '/',
                maxAge: ms(JWT_EXPIRES_IN)
            })
            .status(200).json({
                success: true,
                message: "Token regenerado correctamente"
            })
    } catch (error) {
        next(error);
   }
}

const meController = async (req, res, next) => {
    try {
        const { userId } = req.user;
        const tenantInfo = req.tenant;

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

        if(!user) return next(new CError(ErrorsIndex.UNAUTHORIZED));

        res.status(200).json({ 
            success: true,
            message: "Usuario identificado con éxito",
            data: { 
                user: {
                    ...user,
                    tenantName: tenantInfo.name,
                    tenantSlug: tenantInfo.slug
                }
            } 
        });

    } catch (error) {
        next(error);
    }

}

const activationController = async (req, res, next) => {
    
    try {
        const { token } = req.params;

        const user = await prisma.user.findFirst({
            where: { activationToken : token}
        })

        if(!user) return next(new CError(ErrorsIndex.UNAUTHORIZED));

        const hoursElapsed = (new Date() - new Date(user.activationSentAt));

        if(hoursElapsed > ms("24h")) return next(new CError(ErrorsIndex.UNAUTHORIZED));

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isActive: true,
                activatedAt: new Date(),
                activationToken: null,
                activationSentAt: null
            }
        })

        res.status(200).json({
            success: true,
            message: "El usuario ha sido activado con éxito"
        })
        
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
    meController, 
    activationController
}