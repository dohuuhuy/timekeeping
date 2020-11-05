const db = require("./../models/handlerDB");
const DB = require("./../models/db");
const moment = require("moment");
const excel = require("exceljs");

AddRows = (tutorials) =>
{
  let workbook = new excel.Workbook();
  let worksheet = workbook.addWorksheet("DanhSachTaiKham");

  worksheet.columns = [
    { header: "Số hồ sơ", key: "SoHoSo", width: 15 },
    { header: "Mã đơn vị", key: "MaDonVi", width: 15 },
    { header: "patient_promoId", key: "promoId", width: 20 },
    { header: "Họ và tên", key: "fullname", width: 30 },
    { header: "Năm sinh", key: "birthyear", width: 10 },
    { header: "Số điện thoại", key: "mobile", width: 20 },
    { header: "Tỉnh thành", key: "tinh", width: 20 },
    { header: "Ngày khám", key: "NgayKham", width: 25 },
  ];

  // Add Array Rows
  worksheet.addRows(tutorials);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "DanhSachTaiKham.xlsx"
  );

  workbook.xlsx.write(res).then(function () {
    res.status(200).end();
  });
}


exports.getlisttaikham = async (req, res) => {
  var fromDate = req.params.fromDate;
  var toDate = req.params.toDate;
  var aggreg = [
    {
      $match: {
        NgayKham: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      },
    },
    {
      $lookup: {
        from: "patient",
        localField: "SoHoSo",
        foreignField: "bvdhyd_msbn",
        as: "patient_promo",
      },
    },
    {
      $unwind: "$patient_promo",
    },
    {
      $lookup: {
        from: "dm_city",
        localField: "patient_promo.city_id",
        foreignField: "id",
        as: "dm_city",
      },
    },
  ]

  var list_TaiKham = await DB.getDB().collection("bvdhyd_taikham").aggregate(aggreg).toArray();

  let tutorials = [];
  for (const v of list_TaiKham) {
    tutorials.push({
      SoHoSo: v.SoHoSo,
      MaDonVi: v.MaDonVi,
      promoId: v.patient_promo.id,
      fullname: v.patient_promo.surname + " " + v.patient_promo.name,
      birthyear: v.patient_promo.birthyear,
      mobile: v.patient_promo.mobile,
      tinh: v.dm_city[0].name,
      NgayKham: moment(v.NgayKham).format("YYYY-MM-DD HH:mm:ss"),
    });
  }

  AddRows(tutorials);

};


exports.NewBookingByPartnerID = (req, res) => {};

exports.TinhTiLe = async (req, res) => {
  var x = (req.params.fromDate = "2019-08-23T11:24:48.000+0000");
  var y = (req.params.toDate = "2020-05-06T21:59:14.000+0000");

  var array = [
    {
      collection: "patient",
      objparam: {
        date_create: {
          $gte: new Date(x),
          $lte: new Date(y),
        },
      },
    },
    {
      collection: "booking",
      objparam: {
        date_create: {
          $gte: new Date(x),
          $lte: new Date(y),
        },
      },
    },
    {
      collection: "payment",
      objparam: {
        date_create: {
          $gte: new Date(x),
          $lte: new Date(y),
        },
      },
    },
  ];

  let c = [];
  for (const value of array) {
    x = await db.findBY(value.collection, value.objparam).count();
    c.push(x);
  }

  let count = c.length;
  values = c.reduce((previous, current) => (current += previous));
  values /= count * 100;

  res.send({ data: Math.round(values * 100) / 100 + " %" });
};





