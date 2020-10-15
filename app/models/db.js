const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
const dbname = "medpro";
const dbConfig = require("../../config/database.config");

const mongoOptions = {useNewUrlParser : true,  useUnifiedTopology: true};

const state = {
    db : null
};

const connect = (cb) =>{

    if(state.db)
        cb();
    else{

        MongoClient.connect(dbConfig.url,mongoOptions,(err,client)=>{

            if(err)
                cb(err);

            else{
                state.db = client.db(dbname);
                cb();
            }
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