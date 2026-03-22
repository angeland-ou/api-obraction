const router = require("express").Router();
const { registerController, loginController, logoutController, logoutAllController, refreshController, meController, activationController } = require("../auth/auth.controller");
const authHandler = require("../../middlewares/auth.middleware");

// rutas públicas
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);

// rutas protegidas
router.post("/logout", authHandler, logoutController);
router.post("/logout-all", authHandler, logoutAllController);

router.get("/me", authHandler, meController);
router.get("/activate/:token", activationController);

module.exports = router;