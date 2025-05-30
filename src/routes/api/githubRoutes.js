const router = require("express").Router();
const githubController = require("../../controller/github");

router.post("/webhook", githubController.webhookEvents);

module.exports = router;
