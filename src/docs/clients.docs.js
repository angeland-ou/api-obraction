/**
 * @swagger
 * tags:
 *   name: Clients
 *   description: Gestión de clientes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Phone:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         label:
 *           type: string
 *           example: Móvil
 *         number:
 *           type: string
 *           example: 688989898
 *     Client:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Juan García
 *         surname:
 *           type: string
 *           example: García
 *         email:
 *           type: string
 *           example: juan@empresa.com
 *         nif:
 *           type: string
 *           example: 12345678A
 *         notes:
 *           type: string
 *           example: Cliente importante
 *         createdAt:
 *           type: string
 *           format: date-time
 *         phones:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Phone'
 */

/**
 * @swagger
 * /api/clients:
 *   get:
 *     summary: Obtener todos los clientes del tenant
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Client'
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Datos del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Cliente no encontrado
 */

/**
 * @swagger
 * /api/clients:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: Juan García
 *               surname:
 *                 type: string
 *                 example: García
 *               email:
 *                 type: string
 *                 format: email
 *                 example: juan@empresa.com
 *               nif:
 *                 type: string
 *                 example: 12345678A
 *               notes:
 *                 type: string
 *                 example: Cliente importante
 *               phones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: Móvil
 *                     number:
 *                       type: string
 *                       example: 688989898
 *     responses:
 *       201:
 *         description: Cliente creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Datos no válidos
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /api/clients/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               nif:
 *                 type: string
 *               notes:
 *                 type: string
 *               phones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     number:
 *                       type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       400:
 *         description: Datos no válidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Cliente no encontrado
 */

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     summary: Eliminar un cliente (soft delete)
 *     tags: [Clients]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cliente eliminado correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Cliente no encontrado
 */