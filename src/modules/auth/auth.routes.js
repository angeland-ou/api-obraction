const router = require("express").Router();
const { registerController, loginController, logoutController, logoutAllController, refreshController } = require("../auth/auth.controller");
const authHandler = require("../../middlewares/auth");

// rutas públicas
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);

// rutas protegidas (pasarán por el middleware auth cuando lo creemos)
router.post("/logout", authHandler, logoutController);
router.post("/logout-all", authHandler, logoutAllController);

module.exports = router;