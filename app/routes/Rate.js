var router = require("express").Router();

const callRate = require("../controllers/callRate.controller");

router.get("/getListReExamByDate/:fromDate/:toDate", callRate.getlisttaikham);
//router.get("/getListReExamByDate", callRate.demo);
module.exports = router;
