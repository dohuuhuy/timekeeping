const db = require("./../models/handlerDB");
const DB = require("./../models/db");
const moment = require("moment");
var fs = require("fs");
exports.getlisttaikham = async (req, res) => {
  var x1 = (req.params.fromDate);
  var y1 = (req.params.toDate );

  var x = await DB.getDB()
    .collection("bvdhyd_taikham")
    .aggregate([
      {
        $match: {
          NgayKham: {
            $gte: new Date(x1),
            $lte: new Date(y1),
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
    ])
    .toArray();

  // var data='Số hồ sơ' + '\t'+ 'Mã đơn vị' + '\t'+ 'patient_promoId'+ '\t' + 'Họ và tên' + '\t'+ 'Năm sinh' + '\t' +'Số điện thoại' + '\t' +' Tình thành'  + '\t' + 'Ngày Khám' + '\n';

  let tutorials = [];
  for (const v of x) {
    //data += SoHoSo + '\t'+ MaDonVi + '\t'+ promoId+ '\t' + fullname + '\t'+ birthyear + '\t' +mobile + '\t' + tinh  + '\t' + NgayKham + '\n';

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
};

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

const excel = require("exceljs");

const download = (req, res) => {
  Tutorial.findAll().then((objs) => {
    let tutorials = [];

    objs.forEach((obj) => {
      tutorials.push({
        id: obj.id,
        title: obj.title,
        description: obj.description,
        published: obj.published,
      });
    });

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Tutorials");

    worksheet.columns = [
      { header: "Id", key: "id", width: 5 },
      { header: "Title", key: "title", width: 25 },
      { header: "Description", key: "description", width: 25 },
      { header: "Published", key: "published", width: 10 },
    ];

    // Add Array Rows
    worksheet.addRows(tutorials);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "tutorials.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  });
};