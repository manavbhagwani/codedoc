const service = require("../services");

module.exports = {
  webhookEvents: async (req, res, next) => {
    try {
      await service.handleMergeWebhook(req.body);
      res.send("success");
    } catch (error) {
      return next(error);
    }
  },
};
