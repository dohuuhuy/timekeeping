//const Workship = require('../models/workship.model');

const db = require("./../models/db.js");


// Create and Save a new Note
exports.create = (req, res) => {
 // Validate request
//  if(!req.body.content) {
//     return res.status(400).send({
//         message: "Note content can not be empty"
//     });
// }

// Create a Note
const note = new Workship(req.body);

// Save Note in the database
note.save()
.then(data => {
    res.send(data);
}).catch(err => {
    res.status(500).send({
        message: err.message || "Some error occurred while creating the Note."
    });
});
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    db.getDB().collection("schedules").find({}).toArray()
    .then(schedules => {
        res.send(schedules);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving notes."
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

// Find a single note with a noteId
exports.findOne = (req, res) => {
  var id = req.params.workshipId;
  var cdate = currentDay();
  db.getDB()
    .collection("schedules")
    .find({ partnerId: id, days: new RegExp(cdate, 'i') })
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
};;

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
 // Validate Request
 if(!req.body.content) {
    return res.status(400).send({
        message: "Note content can not be empty"
    });
}

// Find note and update it with the request body
Workship.findByIdAndUpdate(req.params.noteId, {
    title: req.body.title || "Untitled Note",
    content: req.body.content
}, {new: true})
.then(note => {
    if(!note) {
        return res.status(404).send({
            message: "Note not found with id " + req.params.noteId
        });
    }
    res.send(note);
}).catch(err => {
    if(err.kind === 'ObjectId') {
        return res.status(404).send({
            message: "Note not found with id " + req.params.noteId
        });                
    }
    return res.status(500).send({
        message: "Error updating note with id " + req.params.noteId
    });
});
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    Workship.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
};