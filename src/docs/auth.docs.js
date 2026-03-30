/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registro de nuevo usuario y tenant
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - nif
 *               - tenantName
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: angela
 *               email:
 *                 type: string
 *                 format: email
 *                 example: angela@obraction.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Test1234!
 *               nif:
 *                 type: string
 *                 example: 12345678A
 *               tenantName:
 *                 type: string
 *                 minLength: 2
 *                 example: Mi Empresa SL
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario registrado correctamente, revisa tu email para activar tu cuenta
 *                 data:
 *                   type: object
 *                   properties:
 *                     tenant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         name:
 *                           type: string
 *                         slug:
 *                           type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                         role:
 *                           type: string
 *                         tenantId:
 *                           type: string
 *                           format: uuid
 *                         isActive:
 *                           type: boolean
 *       400:
 *         description: Datos no válidos
 *       409:
 *         description: El email o username ya están registrados
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicio de sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: angela@obraction.com
 *               password:
 *                 type: string
 *                 example: Test1234!
 *     responses:
 *       200:
 *         description: Login correcto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario conectado correctamente
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     tenantId:
 *                       type: string
 *                       format: uuid
 *       400:
 *         description: Datos no válidos
 *       401:
 *         description: Email o contraseña incorrectos
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cierre de sesión
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Cierre de sesión en todos los dispositivos
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada en todos los dispositivos
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresco del access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refrescado correctamente
 *       401:
 *         description: Refresh token inválido o expirado
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener datos del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *                     tenantId:
 *                       type: string
 *                       format: uuid
 *                     isActive:
 *                       type: boolean
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /api/auth/activate/{token}:
 *   get:
 *     summary: Activación de cuenta por token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de activación recibido por email
 *     responses:
 *       200:
 *         description: Cuenta activada correctamente
 *       400:
 *         description: Token inválido o expirado
 *       401:
 *         description: Usuario no encontrado
 */