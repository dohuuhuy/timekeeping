const router = require("express").Router();

const { create, findAll } = require("../controllers/support_record.controller");
const { createUserAcc } = require("../controllers/user_account.controller");

// /api/account/sp_record
router.post("/sp_record", create);
router.get("/get_list_sp_record", findAll);

// /api/account/createAccount
router.post("/createAccount", createUserAcc);

module.exports = router;
