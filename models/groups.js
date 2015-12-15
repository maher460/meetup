/*
 * This model uses the Node.js MongoDB Driver.
 * To install:  npm install mongodb --save
 */

var mongoClient = require('mongodb').MongoClient;
var randomstring = require("randomstring");

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

mongoClient.connect('mongodb://'+connection_string, function(err, db) {
  if (err) doError(err);
  console.log("Connected to MongoDB server at: "+connection_string);
  mongoDB = db; // Make reference to db globally available.
  db.collection("groups").createIndex( { "group_key": 1 }, { unique: true } )
});


/********** CRUD Create -> Mongo insert ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} data - The object to insert as a MongoDB document
 * @param {function} callback - Function to call upon insert completion
 *
 * See the API for more information on insert:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#insertOne
 */
exports.create = function(name, owner, callback) {
  console.log("4. Start insert function in groups");

  var group_key = randomstring.generate(7);
  mongoDB.collection("groups").insertOne(

    {"group_key" : group_key, "name": name, "owner": owner, complete: false},   

    function(err, status) {  
      if (err) doError(err);
      console.log("5. Done with mongo insert operation in groups");
      var success = (status.result.n == 1 ? true : false);
      callback(success, group_key);
      console.log("6. Done with insert operation callback in groups");
    });

  console.log("7. Done with insert function in groups");
}


/********** CRUD Retrieve -> Mongo find ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} query - The query object to search with
 * @param {function} callback - Function to call upon completion
 *
 * See the API for more information on find:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#find
 * and toArray:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Cursor.html#toArray
 */
exports.retrieve = function(group_key, callback) {
  mongoDB.collection("groups").find({"group_key" : group_key}).toArray(function(err, docs) {
    if (err) doError(err);
    callback(docs);
  });
}

exports.delete = function(group_key, callback) {
  mongoDB
    .collection("groups")
    .deleteMany(
      {"group_key": group_key},
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        callback('Deleted '+ status);
        });
}

exports.complete = function(group_key, owner, callback) {
  mongoDB
    .collection("groups")     // The collection to update
    .updateMany(                // Use updateOne to only update 1 document
      {"group_key": group_key, "owner": owner},                   // Filter selects which documents to update
      {"$set":{"complete":true}},                   // The update operation
      {upsert:false},            // If document not found, insert one with this update
                                // Set upsert false (default) to not do insert
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        var success = (status.result.n == 1 ? true : false);
        callback(success);
        });
}

/********** CRUD Update -> Mongo updateMany ***********************************
 * @param {string} collection - The collection within the database
 * @param {object} filter - The MongoDB filter
 * @param {object} update - The update operation to perform
 * @param {function} callback - Function to call upon completion
 *
 * See the API for more information on insert:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#updateMany
 */
exports.setLocation = function(group_key, owner, latitude, longitude, callback) {
  mongoDB
    .collection("groups")     // The collection to update
    .updateMany(                // Use updateOne to only update 1 document
      {"group_key": group_key, "owner": owner},                   // Filter selects which documents to update
      {"$set":{"latitude": latitude, "longitude": longitude }},                   // The update operation
      {upsert:true},            // If document not found, insert one with this update
                                // Set upsert false (default) to not do insert
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        var success = (status.result.n == 1 ? true : false);
        callback(success);
        });
}
