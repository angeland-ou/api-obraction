const router = require("express").Router();
const auth = require("../../middlewares/auth.middleware");
const { registerController, loginController, logoutController, logoutAllController, refreshController, meController, activationController } = require("../auth/auth.controller");

// rutas públicas
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);
router.get("/activate/:token", activationController);

// rutas protegidas
router.use(auth);

router.post("/logout", logoutController);
router.post("/logout-all", logoutAllController);
router.get("/me", meController);

module.exports = router;