/*
 * This model uses the Node.js MongoDB Driver.
 * To install:  npm install mongodb --save
 */

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
  db.collection("places").createIndex( { "group_key": 1, "place_id": 1 }, { unique: true } )
});

/********** CRUD Create -> Mongo insert ***************************************
 * @param {string} collection - The collection within the database
 * @param {object} data - The object to insert as a MongoDB document
 * @param {function} callback - Function to call upon insert completion
 *
 * See the API for more information on insert:
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#insertOne
 */
exports.create = function(group_key, places_id, name, rating, description, longitude, latitude, callback) {
  console.log("4. Start insert function in groups");

  mongoDB.collection("places").insertOne(

    {"group_key" : group_key, "places_id": places_id, "name": name, "rating": rating, "description": description, "longitude": longitude, "latitude": latitude},   

    function(err, status) {  
      if (err) doError(err);
      console.log("5. Done with mongo insert operation in places");
      var success = (status.result.n == 1 ? true : false);
      callback(success, group_key);
      console.log("6. Done with insert operation callback in places");
    });

  console.log("7. Done with insert function in places");
}

exports.createMany = function(docs, callback) {
  console.log("4. Start insert function in groups");

  mongoDB.collection("places").insertMany(

    docs,  

    function(err, status) {  
      if (err) doError(err);
      console.log("5. Done with mongo insert operation in places");
      var success = (status.result.n >= 1 ? true : false);
      callback(success);
      console.log("6. Done with insert operation callback in places");
    });

  console.log("7. Done with insert function in places");
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
exports.retrieve_all = function(group_key, callback) {
  mongoDB.collection("places").find({"group_key" : group_key}).toArray(function(err, docs) {
    if (err) doError(err);
    callback(docs);
  });
}

exports.retrieve_one = function(group_key, place_id, callback) {
  mongoDB.collection("places").find({"group_key" : group_key, "place_id" : place_id}).toArray(function(err, docs) {
    if (err) doError(err);
    callback(docs);
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
exports.updateVotes = function(group_key, place_id, votes, callback) {
  mongoDB
    .collection("places")     // The collection to update
    .updateMany(                // Use updateOne to only update 1 document
      {"group_key": group_key, "place_id": place_id},                   // Filter selects which documents to update
      {"$set":{"vote": votes}},                   // The update operation
      {upsert:false},            // If document not found, insert one with this update
                                // Set upsert false (default) to not do insert
      function(err, status) {   // Callback upon error or success
        if (err) doError(err);
        var success = (status.result.n >= 1 ? true : false);
        callback(success);
      });
}
