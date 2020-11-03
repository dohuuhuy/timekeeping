const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbname = "report";
const dbConfig = require("../../config/database.config");

const mongoOptions = {useNewUrlParser : true,  useUnifiedTopology: true};

const state = {
    db : null
};

const connect = () =>{

    if(state.db)
    {}
    else{

        MongoClient.connect(dbConfig.url,mongoOptions,(err,client)=>{

            if(!err)
              
  state.db = client.db(dbname);
           
        });
    }
}


const getPrimaryKey = (_id)=>{
    return ObjectID(_id);
}


const getDB = ()=>{
    return state.db;
}

module.exports = {getDB,connect,getPrimaryKey};