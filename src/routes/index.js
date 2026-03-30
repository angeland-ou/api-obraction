const router = require("express").Router();

router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/clients", require("../modules/clients/clients.routes"));

module.exports = router;