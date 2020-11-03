const db = require("./db");

exports.findBY = (collection, objectParam) => {
  return db.getDB().collection(collection).find(objectParam);
};

