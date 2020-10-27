const User_account = require("../models/user_account.model");
const Axios = require("Axios");

const db = require("./../models/db");

// Create and Save a new User_account
exports.createUserAcc = async (req, res) => {
  // var Url = "http://103.48.193.51:1241/card/v1/account/createAccount";
  //const x = await Axios.post(Url, data);
  // console.log(x.data);
  patient_Code = req.body.MSBN;
  console.log("object", patient_Code);
  var patientCode = await db
    .getDB()
    .collection("patient_codes")
    .find({ patientCode: patient_Code })
    .toArray();

  console.log("patient_codes :>> ", patientCode);
  console.log("partnerId: :>> ", patientCode[0].partnerId);
  console.log("patientId: :>> ", patientCode[0].patientId);

  var patientId = patientCode[0].patientId;
  var partnerId = patientCode[0].partnerId;

  var patients = await db
    .getDB()
    .collection("patients")
    .find({ id: patientId })
    .toArray();
  console.log("patient_codes :>> ", patients.length);

  var ID_in_patients = patients[0]._id;
  console.log("ID_in_patients :>> ", ID_in_patients);

  var users = await db
    .getDB()
    .collection("users")
    .find({ patients: db.getPrimaryKey(ID_in_patients) })
    .toArray();

  console.log("users :>> ", users);
  var userID = users[0]._id;

  const Uacc = new User_account({
    partnerId: partnerId,
    UserId: userID,
    MSBN: patient_Code,
  });

  return res.send({
    success: true,
    message: "Thành công",
    data: {
      MSBN: patient_Code,
      partner: patientCode[0],
      User: users[0],
    },
  });
  // return Uacc.save()
  //   .then((data) => {
  //     res.send({ success: true, message: "Thêm mới thành công", data: data });
  //   })
  //   .catch((err) => {
  //     res.status(500).send({
  //       message: err.message || "Some error occurred while creating the Note.",
  //     });
  //   });
};

// Retrieve all User_accounts from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title
    ? { title: { $regex: new RegExp(title), $options: "i" } }
    : {};

  User_account.find(condition)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

// Find a single User_account with an id
exports.findOne = async (req, res) => {
  const id = (patient_Code = req.params.id);
  console.log("object", patient_Code);
  var patientCode = await db
    .getDB()
    .collection("patient_codes")
    .find({ patientCode: patient_Code })
    .toArray();

  console.log("patient_codes :>> ", patientCode);
  console.log("partnerId: :>> ", patientCode[0].partnerId);
  console.log("patientId: :>> ", patientCode[0].patientId);

  var patientId = patientCode[0].patientId;
  var partnerId = patientCode[0].partnerId;

  var patients = await db
    .getDB()
    .collection("patients")
    .find({ id: patientId })
    .toArray();
  console.log("patient_codes :>> ", patients.length);

  var ID_in_patients = patients[0]._id;
  console.log("ID_in_patients :>> ", ID_in_patients);

  var users = await db
    .getDB()
    .collection("users")
    .find({ patients: db.getPrimaryKey(ID_in_patients) })
    .toArray();

  console.log("users :>> ", users);
  var userID = users[0]._id;

  const Uacc = new User_account({
    partnerId: partnerId,
    UserId: userID,
    MSBN: patient_Code,
  });

  return res.send({
    success: true,
    message: "Thành công",
    data: {
      MSBN: patient_Code,
      partner: patientCode[0],
      User: users[0],
    },
  });
};

// Update a User_account by the id in the request
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({
      message: "Data to update can not be empty!",
    });
  }

  const id = req.params.id;

  User_account.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update User_account with id=${id}. Maybe User_account was not found!`,
        });
      } else res.send({ message: "User_account was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating User_account with id=" + id,
      });
    });
};

// Delete a User_account with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  User_account.findByIdAndRemove(id)
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete User_account with id=${id}. Maybe User_account was not found!`,
        });
      } else {
        res.send({
          message: "User_account was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete User_account with id=" + id,
      });
    });
};

// Delete all User_accounts from the database.
exports.deleteAll = (req, res) => {
  User_account.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} User_accounts were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all tutorials.",
      });
    });
};

// Find all published User_accounts
exports.findAllPublished = (req, res) => {
  User_account.find({ published: true })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};
