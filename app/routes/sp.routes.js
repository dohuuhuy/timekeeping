var router = require("express").Router();

const support = require("../controllers/support_record.controller");

router.post("/sp_record", support.create);

router.get("/sp_record", support.findAll);

router.get("/sp_record/:sp_recordId", support.findOne);

router.put("/sp_record/:sp_recordId", support.update);

router.delete("/sp_record/:sp_recordId", support.delete);

const user_account = require("../controllers/user_account.controller");

router.post("/createAccount", user_account.createUserAcc);

router.get("/createAccount", user_account.findAll);

router.get("/createAccount/:id", user_account.findOne);

router.put("/createAccount/:id", user_account.update);

router.delete("/createAccount/:id", user_account.delete);

// router.delete("/delUserAcc/:id", user_account.deleteID);

module.exports = router;
