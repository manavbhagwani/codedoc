const router = require("express").Router();
const githubRoutes = require("./api/githubRoutes");

router.use("/github", githubRoutes);

module.exports = router;
