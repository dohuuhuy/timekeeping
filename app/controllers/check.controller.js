const Checks = require('../models/checktime.model.js');


exports.create = (req, res) => {
// Validate request
if(!req.body.locationData ) {
    return res.status(400).send({
        message: "NlocationData:  can not be empty"
    });
}

// Create a checks

const check = new Checks({
    locationData: req.body.locationData || "Untitled checks", 
    locationDetail: req.body.locationDetail,
    //time:   // req.body.time,
    action: req.body.action
});

// Save checks in the database
check.save()
.then(data => {
    res.send({message: "success"});
}).catch(err => {
    res.status(500).send({
        message: err.message || "Some error occurred while creating the checks."
    });
});
};

exports.findAll = (req, res) => {
    Checks.find()
    .then(checks => {
        res.send(checks);
        console.log(checks);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving checkss."
        });
    });
};

exports.findOne = (req, res) => {
    Checks.findById(req.params.checkId)
    .then(checks => {
        if(!checks) {
            return res.status(404).send({
                message: "checks not found with id " + req.params.checkId
            });            
        }
        res.send(checks);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "checks not found with id " + req.params.checkId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving checks with id " + req.params.checkId
        });
    });
};

exports.update = (req, res) => {
    
};

exports.delete = (req, res) => {

};