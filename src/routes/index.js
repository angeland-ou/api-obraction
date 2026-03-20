const router = require("express").Router();

router.use("/auth", require("../modules/auth/auth.routes"));

module.exports = router;