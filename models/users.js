/*
 * This model uses the Node.js MongoDB Driver.
 * To install:  npm install mongodb --save
 */

var mongo = require('mongodb');
var mongoClient = require('mongodb').MongoClient;

/*
 * This connection_string is for mongodb running locally.
 * Change nameOfMyDb to reflect the name you want for your database
 */
var connection_string = 'localhost:27017/meetup';

/*
 * If OPENSHIFT env variables have values, then this app must be running on 
 * OPENSHIFT.  Therefore use the connection info in the OPENSHIFT environment
 * variables to replace the connection_string.
 */
if(process.env.OPENSHIFT_MONGODB_DB_PASSWORD){
  connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
}

// Global variable of the connected database
var mongoDB; 

var doError = function(e) {
        console.error("ERROR: " + e);
        throw new Error(e);
    }

// Use connect method to connect to the MongoDB server
mongoClient.connect('mongodb://'+connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected to MongoDB server at: "+connection_string);
  mongoDB = db; // Make reference to db globally available.
  db.collection("users").createIndex( { "username": 1 }, { unique: true } )
});

/* 
 * Find a user given their username
 * @param {string} username - username to be searched for in the database
 * @param {function} callback - the function to call upon completion
 *
 * Note that this function is not asynchronous, so the user value could have
 * been the function return value. But when you put a database query in 
 * here it *will* be asynchronous so you will have to use a callback. Therefore
 * the example uses a callback for you to more easily make that transition to a
 * database.
 */
exports.findByUsername = function(username, callback) {

  mongoDB.collection("users").findOne({"username" : username}, function(err, doc){

  	console.log("users.js findbyusername \n");
  	console.log(doc);
  	console.log("\n");

    callback(err, doc);
  });

}

/* 
 * Find a user given their id
 * @param {number} id - id to be searched for in the database
 * @param {function} callback - the function to call upon completion
 */
exports.findById = function(id, callback) {

 var o_id = new mongo.ObjectID(id);
 mongoDB.collection("users").findOne({"_id" : o_id}, function(err, doc){

 	console.log(id);

 	console.log("users.js findbyid \n");
 	console.log(doc);
 	console.log("\n");

    callback(err, doc);
  });

}

exports.newUser = function(username, password, displayName, callback) {

 console.log("4. Start insert function in users");

  mongoDB.collection("users").insertOne(

    {"username" : username, "password": password, "displayName": displayName},   

    function(err, status) {  
      if (err) doError(err);
      console.log("Done with mongo insert operation in users");
      var success = (status.result.n == 1 ? true : false);
      callback(success);
      console.log("6. Done with insert operation callback in users");
    });



}