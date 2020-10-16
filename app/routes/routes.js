module.exports = (app) => {
  const check = require("../controllers/check.controller.js");

  var router = require("express").Router();

  router.post("/checks", check.create);

  router.get("/checks", check.findAll);

  router.get("/checks/:checkId", check.findOne);

  router.put("/checks/:checkId", check.update);

  router.delete("/checks/:checkId", check.delete);

  const workships = require("../controllers/workship.controller.js");

  router.post("/workships", workships.create);

  router.get("/workships", workships.findAll);

  router.get("/workships/:workshipId", workships.findOne);

  router.put("/workships/:workshipId", workships.update);

  router.delete("/workships/:workshipId", workships.delete);

  const locations = require("../controllers/location.controller");

  router.post("/locations", locations.create);

  router.get("/locations", locations.findAll);

  router.get("/locations/:locationId", locations.findOne);

  router.put("/locations/:locationId", locations.update);

  router.delete("/locations/:locationId", locations.delete);

  app.use("/worktime", router);
};
