const db = require("./../models/db");
const moment = require("moment");

exports.getlisttaikham = async (req, res) => {
  var rs = await db
    .getDB()
    .collection("bvdhyd_taikham")
    .find({
      NgayKham: {
        $gte: new Date(req.params.fromDate),
        $lte: new Date(req.params.toDate),
      },
    })
    .toArray();

  console.log("rs", rs);
  res.send({ data: rs });
};
