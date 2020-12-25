const { post_Login } = require("../middleware/login.controller");
var router = require("express").Router();
router.post("/get_token_login", post_Login);
module.exports = router;
