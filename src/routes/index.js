const router = require("express").Router();

router.use("/auth", require("../modules/auth/auth.routes"));
router.use("/clients", require("../modules/clients/clients.routes"));
router.use("/projects", require("../modules/projects/projects.routes"));

module.exports = router;