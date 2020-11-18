const check = require("../controllers/check.controller.js");
const {
  check_token_login,
  post_Login,
} = require("../middleware/login.controller.js");

var router = require("express").Router();

router.post("/checks", check.create);

router.post("/demo", check_token_login, check.demo1);
router.get("/demo2", check_token_login, check.demo2);

router.get("/checks", check.findAll);

router.post("/history_checks", check.history_Checks_By_Date);

router.get("/lastCheck/:checkId", check.lastCheck);

router.put("/checks/:checkId", check.update);

router.delete("/checks/:checkId", check.delete);

router.delete("/delChecksID/:id", check.deleteID);

router.delete("/", check.deleteAll);

const workships = require("../controllers/workSchedules.controller");

router.post("/workships", workships.create);

router.get("/workships", workships.findAll);

router.get("/workships/:workshipId", workships.findOne);

router.put("/workships/:workshipId", workships.update);

router.delete("/workships/:workshipId", workships.delete);

const locations = require("../controllers/location.controller");

router.post("/locations", locations.create);

router.get("/locations", locations.findAll);

router.get("/locations/:partnerId", locations.findOne);

router.put("/locations/:partnerId", locations.update);

router.delete("/locations/:partnerId", locations.delete);

// router.post("/get_token_login", post_Login);

// router.post("/check_token_login", check_token_login);

module.exports = router;
