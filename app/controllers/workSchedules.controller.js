const Workship = require("../models/workship.model");

//const db = require("../models/db.js");

exports.create = (req, res) => {
  const note = new Workship(req.body);

  note
    .save()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Note.",
      });
    });
};

exports.findAll = (req, res) => {
  Workship.find()
    .then((schedules) => {
      res.send(schedules);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving notes.",
      });
    });
};

currentDay = () => {
  var date = new Date();
  var current_day = date.getDay();
  const days = new Map();
  days
    .set(0, "CN")
    .set(1, "2")
    .set(2, "3")
    .set(3, "4")
    .set(4, "5")
    .set(5, "6")
    .set(6, "7");
  return days.get(current_day);
};

exports.findOne = (req, res) => {
  var id = req.params.workshipId;
  var cdate = currentDay();
  Workship.find({ partnerId: id, days: RegExp(cdate, "i") })
    .sort({ shiftId: 1 })
    .toArray()
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: "Note not found with id " + req.params.workshipId,
        });
      }
      res.send(note);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.workshipId,
        });
      }
      return res.status(500).send({
        message: "Error retrieving note with id " + req.params.workshipId,
      });
    });
};

exports.update = (req, res) => {
  if (!req.body.content) {
    return res.status(400).send({
      message: "Note content can not be empty",
    });
  }

  Workship.findByIdAndUpdate(
    req.params.noteId,
    {
      title: req.body.title || "Untitled Note",
      content: req.body.content,
    },
    { new: true }
  )
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: "Note not found with id " + req.params.noteId,
        });
      }
      res.send(note);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.noteId,
        });
      }
      return res.status(500).send({
        message: "Error updating note with id " + req.params.noteId,
      });
    });
};

exports.delete = (req, res) => {
  Workship.findByIdAndRemove(req.params.noteId)
    .then((note) => {
      if (!note) {
        return res.status(404).send({
          message: "Note not found with id " + req.params.noteId,
        });
      }
      res.send({ message: "Note deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return res.status(404).send({
          message: "Note not found with id " + req.params.noteId,
        });
      }
      return res.status(500).send({
        message: "Could not delete note with id " + req.params.noteId,
      });
    });
};
