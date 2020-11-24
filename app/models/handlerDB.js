const db = require("./db");

checkdb = () => {};

exports.FindBy = (collection, params) => {
  db.connect();
  return db.getDB().collection(collection).find(params);
};
exports.FindOne = (collection, params) => {
  return db.getDB().collection(collection).findOne(params);
};
