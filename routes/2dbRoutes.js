//This file defines most of the routes and general functions needed by the app. 
//Some of the routes and functions are still not implemented fully but will be so in the future iteration.

var http = require('https');
var geolib = require('geolib');

var groups = require("../models/groups.js")
var members = require("../models/members.js")
var places = require("../models/places.js")

exports.init = function(app) {
  app.get('/', index); // essentially the app welcome page

  //group operations
  app.put('/newGroup/:name', checkAuthentication, doNewGroup);
  app.get('/group/:group_key', checkAuthentication, doCheckPlacesRedirect, doGetGroup);
  app.get('/groupUpdate/:group_key', checkAuthentication, doCheckPlacesRedirectString, doGroupUpdate);
  app.delete('/deleteGroup/:group_key', doDeleteGroup);
  app.post('/completeGroup/:group_key', checkAuthentication, doCompleteGroup);

  //members operations
  app.put('/addMember/:group_key/:latitude/:longitude', checkAuthentication, doCheckMember, doAddMember);
  app.get('/getMembers/:group_key', doGetMembers);
  app.get('/getMembers/:group_key/:user_id', doGetOneMember);
  app.post('/updateMemberLocation/:group_key/:user_id/:longitude/:latitude', doUpdateMemberLocation);
  app.delete("/deleteMember/:group_key/:user_id", doDeleteMember);

  //places operations
  app.put('/addPlace/:group_key/:places_id/:name/:rating/:description/:longitude/:latitude', doAddPlace)
  app.get('/places/:group_key', checkAuthentication, doCheckMember, doCheckGroupComplete, doCheckProgressRedirect, doGetAllPlaces);
  app.get('/placesUpdate/:group_key', checkAuthentication, doCheckMember, doCheckGroupComplete, doCheckProgressRedirectString, doPlacesUpdate);
  app.get('/places/:group_key/:place_id', doGetOnePlace);
  app.post('/votePlace/:group_key/:place_id', checkAuthentication, doVotePlace);

  //progress operations
  app.get('/progress/:group_key', checkAuthentication, doCheckMember, doCheckGroupComplete, doGetProgress);

}



//This function gets the places near the location provided and saves them in the database.
//This does a Google Places API call to get the places.
doAPI = function(group_key, latitude, longitude, req, res) {
  var api_key = 'AIzaSyCgNDOgfPfeL7mQvEjLooRfyNhK5wygFBk';

  var query_path = '/maps/api/place/nearbysearch/json?key=' + api_key;
  query_path = query_path + '&location=' + latitude + ',' + longitude
  query_path = query_path + '&radius=500'
  query_path = query_path + '&type=amusement_park|art_gallery|bar|bowling_alley|cafe|casino|food|movie_theater|park|restaurant|shopping_mall'

  console.log(query_path + "\n");
  console.log(latitude + "\n");
  console.log(longitude + "\n");

  var options = {
    host :  'maps.googleapis.com',
    path : query_path,
  }

  http.get(options, function(reply) {
  console.log("statusCode: ", reply.statusCode);
  console.log("headers: ", reply.headers);

  var bla = "";

  reply.on('data', function(d) {
    //process.stdout.write(d);
    bla = bla + d;
  });

  reply.on('end', function(d) {
    var blabla = JSON.parse(bla);
    blabla = blabla["results"];
    //res.render('results',{title: 'Meetup', obj: blabla});
    console.log(blabla);
    console.log(blabla.length);
    //res.end("All done!");

    var count = 0
    var docs = [];
    for(var i = 0; i < blabla.length; i++){
      

      if(count < 5 && blabla[i] && blabla[i].opening_hours && blabla[i].opening_hours.open_now &&
          blabla[i].geometry && blabla[i].geometry.location && blabla[i].place_id && 
          blabla[i].rating && blabla[i].vicinity && blabla[i].name){

        console.log(blabla[i].opening_hours.open_now);
        console.log(blabla[i].geometry.location);

        var p = blabla[i];

        var temp = {"group_key": group_key, "place_id": p.place_id, "name": p.name, "vicinity": p.vicinity,
                    "rating": p.rating, "latitude": p.geometry.location.lat, "longitude": p.geometry.location.lng,
                    "icon": p.icon, "types": p.types, "vote": []}
        docs.push(temp);

        count++;

      }
    }

    places.createMany ( docs,
                       function(result) {
                        // result equal to true means create was successful
                        console.log("***********************\n");
                        console.log(result);
                        if(result){
                          res.end("DONE WITH ADDING PLACES!");
                        } else {
                          res.end("Failed!");
                        }
                        console.log("2. Done with callback in doAPI places updateMany");
                      });

  });

  }).on('error', function(e) {
    console.error(e);
    res.end("Failed!");
  });


}


//This loads the welcome page.
index = function(req, res) {
  res.render('index2');
};

//This function creates a new group.
doNewGroup = function(req, res){
  console.log("1. Starting newGroup in dbRoutes");

  groups.create ( req.params.name, req.user.username,
                      function(result, group_key) {
                        // result equal to true means create was successful
                        var success = (result ? group_key : "Create unsuccessful");
                        res.end(success);
                        console.log("2. Done with callback in dbRoutes create");
                      });
  console.log("3. Done with doNewGroup in dbRoutes");
}


//THis function updates the group and gets the latest info.
doGroupUpdate = function(req, res){
   members.retrieve(
    req.params.group_key, 
    function(modelData) {
      if (modelData.length) {
        //res.render('results',{title: 'Meetup', obj: modelData});
        var temp = []
        for(var i=0; i < modelData.length; i++){
          temp.push(modelData[i].user_id);
        }
        res.end( JSON.stringify(temp) );

      } else {
        res.end( JSON.stringify([]) );
      }
    });
}

//This function returns the group info.
doGetGroup = function(req, res){
  groups.retrieve(
    req.params.group_key, 
		function(modelData) {
		  if (modelData.length) {
        res.render('group',{title: 'Meetup', group_name: modelData[0].name, 
          group_key: modelData[0].group_key, group_owner: modelData[0].owner,
          username: req.user.username
        });
      } else {
        var message = "No group with key "+JSON.stringify(req.params.group_key)+ 
                      "in the database found.";
        res.render('message', {title: 'Meetup', obj: message});
      }
		});
}

//This function deletes the group.
doDeleteGroup = function(req, res){

	groups.delete(
    req.params.group_key,
		function(status) {
				  res.render('message',{title: 'Meetup', obj: status});
		                  });
}

//This function sets the group as complete.
doCompleteGroup = function(req, res){
  groups.complete(req.params.group_key, req.user.username, function(success){
    if(success){
      //res.end("Group set to complete.");
      doSetLocation(req.params.group_key, req, res);
    }
    else{
      res.end("Failed.");
    }
      
  });
}

//This function sets the location of the group to a equidistance location form everyone.
function doSetLocation(group_key, req, res){
  members.retrieve(
    group_key, 
    function(modelData) {

      if (modelData.length) {
        var temp = [];
        for(var i = 0; i < modelData.length; i++){
          temp.push({latitude: (modelData[i].latitude), longitude: (modelData[i].longitude)});
        }
        console.log(temp);
        var temp2 = geolib.getCenter(temp);


        groups.setLocation(group_key, req.user.username, temp2.latitude, temp2.longitude, function(success){
          if(success){
            //res.end("Group set to complete.");
            //res.end("Group is set to complete and center location has been calculated and saved");
            doAPI(group_key, temp2.latitude, temp2.longitude, req, res);

          }
          else{
            res.end("Failed.");
          }
        });



      } else {
        res.end("Failed.");
      }

    });
}

//This function updates tge places in the database.
doPlacesUpdate = function(req, res){
  members.retrieve(req.params.group_key, function(result){
    if(result.length){
      places.retrieve_all(
      req.params.group_key, 
      function(modelData) {
        if(modelData.length){

          var total_votes = 0;

          for(var i=0; i < modelData.length; i++){
            total_votes = total_votes + modelData[i].vote.length;
          }

          console.log(result.length);
          console.log(total_votes);

          //res.end( JSON.stringify({total users: }) )
          var not_voted = []
          for(var i = 0; i < result.length; i++){
            var found = false;
            for(var k = 0; k < modelData.length; k++){
              for(var z = 0; z < modelData[k].vote.length; z++)
                if(result[i].user_id == modelData[k].vote[z].username){
                  found = true;
                }
            }
            if(!found){
              not_voted.push(result[i].user_id);
            }
          }

          res.end( JSON.stringify(not_voted) );


          // if(result.length == total_votes){
          //   console.log(modelData);
          //   //console.log(i);
          //   res.end("Redirect to Progress");
          // }
          // else{
          //    res.end("Failed");
          // }

        }
        else{
          res.end("Failed");
        }
      });
    }
    else{
      res.end("Failed");
    }
  })
}

//This function checks whether to redirect to the Progress page and if so returns a string.
doCheckProgressRedirectString = function(req, res, next){
  members.retrieve(req.params.group_key, function(result){
    if(result.length){
      places.retrieve_all(
      req.params.group_key, 
      function(modelData) {
        if(modelData.length){

          var total_votes = 0;

          for(var i=0; i < modelData.length; i++){
            total_votes = total_votes + modelData[i].vote.length;
          }

          console.log(result.length);
          console.log(total_votes);
          if(result.length == total_votes){
            console.log(modelData);
            //console.log(i);
            res.end("Redirect to Progress");
          }
          else{
             next();
          }

        }
        else{
          next();
        }
      });
    }
    else{
      next();
    }
  })
}

//This function checks whether to redirect to the Progress page and if so redirects
doCheckProgressRedirect = function(req, res, next){
  members.retrieve(req.params.group_key, function(result){
    if(result.length){
      places.retrieve_all(
      req.params.group_key, 
      function(modelData) {
        if(modelData.length){

          var total_votes = 0;

          for(var i=0; i < modelData.length; i++){
            total_votes = total_votes + modelData[i].vote.length;
          }

          console.log(result.length);
          console.log(total_votes);
          if(result.length == total_votes){
            console.log(modelData);
            //console.log(i);
            res.redirect("/progress/" + req.params.group_key);
          }
          else{
             next();
          }

        }
        else{
          next();
        }
      });
    }
    else{
      next();
    }
  })
}

//This function checks whether to redirect to the places page.
doCheckPlacesRedirect = function(req, res, next){
  groups.retrieve(req.params.group_key, function(docs){
    if(docs.length){
      if(docs[0].complete && (docs[0].complete == true) ){
        res.redirect("/places/" + req.params.group_key);
      }
      else {
        next();
      }
    }
    else{
      next();
    }
  })
}

//This function checks whether to redirect to the places page and if so then return a string to the client.
doCheckPlacesRedirectString = function(req, res, next){
  groups.retrieve(req.params.group_key, function(docs){
    if(docs.length){
      if(docs[0].complete && (docs[0].complete == true) ){
        res.end("Redirect to Places");
      }
      else {
        next();
      }
    }
    else{
      next();
    }
  })
}


doCheckGroupComplete = function(req, res, next){
  groups.retrieve(req.params.group_key, function(docs){
    if(docs.length){
      if(docs[0].complete && (docs[0].complete == true) ){
        next();
      }
      else {
        res.end("Group is not complete yet!");
      }
    }
    else{
      res.end("Group does not exist with the given group key.")
    }
  })
}

doCheckMember = function(req, res, next){
  groups.retrieve(req.params.group_key, function(docs){
    if(docs.length){
      if(docs[0].complete && (docs[0].complete == true) ){
        members.retrieve_one(req.params.group_key, req.user.username, function(docs){
          if(docs.length){
            next();
          }
          else{
            res.end("Group is complete and you are not in it!");
          }
        })
      }
      else {
        next();
      }
    }
    else{
      res.end("Group does not exist with the given group key.")
    }
  })
}

doAddMember = function(req, res){
  console.log("1. Starting addMember in dbRoutes");

  members.create ( req.params.group_key,
  				   req.user.username,
  				   req.params.longitude,
  				   req.params.latitude,
                      function(result) {
                        // result equal to true means create was successful
                        var success = (result ? "Create successful" : "Create unsuccessful");
                        res.end(success);
                        console.log("2. Done with callback in dbRoutes create");
                      });

  console.log("3. Done with doAddMember in dbRoutes");
}

doGetMembers = function(req, res){
  members.retrieve(
    req.params.group_key, 
		function(modelData) {
		  if (modelData.length) {
        res.render('results',{title: 'Meetup', obj: modelData});
      } else {
        var message = "No members with group key "+JSON.stringify(req.params.group_key)+ 
                      "in the database found.";
        res.render('message', {title: 'Meetup', obj: message});
      }
		});
}

doGetOneMember = function(req, res){
  members.retrieve_one(
    req.params.group_key, 
    req.params.user_id,
		function(modelData) {
		  if (modelData.length) {
        res.render('results',{title: 'Meetup', obj: modelData});
      } else {
        var message = "No members with group key "+JSON.stringify(req.params.group_key)+ 
                      " and user_id" + JSON.stringify(req.params.user_id) + "in the database found.";
        res.render('message', {title: 'Meetup', obj: message});
      }
		});
}

doUpdateMemberLocation = function(req, res){
  
  console.log("1. Starting updateMemberLocation in dbRoutes");

  members.update(  req.params.group_key,
	  				   req.params.user_id,
	  				   req.params.longitude,
	  				   req.params.latitude,
		                  function(status) {
              				  res.render('message',{title: 'Meetup', obj: status});
              				  console.log("2. Done with callback in dbRoutes update");
		                  });
  console.log("3. Done with doupdateMemberLocation in dbRoutes");
}

doDeleteMember = function(req, res){

	members.delete(
    req.params.group_key,
    req.params.user_id, 
		function(status) {
				  res.render('message',{title: 'Meetup', obj: status});
		                  });

}

doAddPlace = function(req, res){
  console.log("1. Starting addPlace in dbRoutes");

  places.create ( req.params.group_key,
  				   req.params.places_id,
  				   req.params.name,
  				   req.params.rating,
  				   req.params.description,
  				   req.params.longitude,
  				   req.params.latitude,
                      function(result) {
                        // result equal to true means create was successful
                        var success = (result ? "Create successful" : "Create unsuccessful");
                        res.render('message', {title: 'Meetup', obj: success});
                        console.log("2. Done with callback in dbRoutes create");
                      });
  console.log("3. Done with doAddPlace in dbRoutes");
}

doGetAllPlaces = function(req, res){
  places.retrieve_all(
    req.params.group_key, 
		function(modelData) {
		  if (modelData.length) {
        res.render('places',{title: 'Meetup', group_key: req.params.group_key, obj: modelData});
      } else {
        var message = "No places with group key "+JSON.stringify(req.params.group_key)+ 
                      "in the database found.";
        res.render('message', {title: 'Meetup', obj: message});
      }
		});
}

doGetOnePlace = function(req, res){
  places.retrieve_one(
    req.params.group_key, 
    req.params.place_id,
		function(modelData) {
		  if (modelData.length) {
        res.render('results',{title: 'Meetup', obj: modelData});
      } else {
        var message = "No places with group key "+JSON.stringify(req.params.group_key)+ 
                      " and places_id" + JSON.stringify(req.params.places_id) + "in the database found.";
        res.render('message', {title: 'Meetup', obj: message});
      }
		});
}

doVotePlace = function(req, res){
  places.retrieve_all(
    req.params.group_key, 
    function(modelData) {

      if (modelData.length) {
        var already_voted = false;
        var prev_votes = null;
        for(var i=0; i < modelData.length; i++){
          if(modelData[i].place_id == req.params.place_id){
              prev_votes = modelData[i].vote;
            }
          for(var k=0; k < modelData[i].vote.length; k++){
            if(modelData[i].vote[k].username == req.user.username){
              already_voted = true
            }
          }
        }
        if(!already_voted && (prev_votes != null) ){
          prev_votes.push({"username": req.user.username});
          places.updateVotes(req.params.group_key, req.params.place_id, prev_votes, function(success){
            if(success){
              res.end("Vote completed!");
            }
            else{
              res.end("Failed!");
            }
          });
        }
        else{
          res.end("Already voted!");
        }
      } else {
        var message = "No places with group key "+JSON.stringify(req.params.group_key)+ 
                      " and place_id" + JSON.stringify(req.params.place_id) + "in the database found.";
        res.render('message', {title: 'Meetup', obj: message});
      }

    });
}


doGetProgress = function(req, res){

  members.retrieve(req.params.group_key, function(result){
    if(result.length){
      places.retrieve_all(
      req.params.group_key, 
      function(modelData) {
        if(modelData.length){

          var total_votes = 0;
          var best_place_num = 0;
          var max_vote = 0;

          for(var i=0; i < modelData.length; i++){
            total_votes = total_votes + modelData[i].vote.length;
            if(modelData[i].vote.length > max_vote){
              max_vote = modelData[i].vote.length;
              best_place_num = i;
            }
          }

          console.log(result.length);
          console.log(total_votes);
          if(result.length == total_votes){
            console.log(modelData);
            //console.log(i);
            res.render('progress',{title: 'Meetup', group_key: req.params.group_key, obj: (modelData[best_place_num]) });
          }
          else{
             res.render('message', {title: 'Meetup', obj: "Failed! 3"});
          }

        }
        else{
          res.render('message', {title: 'Meetup', obj: "Failed! 2"});
        }
      });
    }
    else{
      res.render('message', {title: 'Meetup', obj: "Failed! 1"});
    }
  })

}



function checkAuthentication(req, res, next){
    // Passport will set req.isAuthenticated
    console.log("METHOD: ")
    console.log(req.method);
    if(req.isAuthenticated()){
        // call the next bit of middleware
        //    (as defined above this means doMembersOnly)
        next();
    }else{
        // The user is not logged in. Redirect to the login page.
        if(req.method == "GET"){
          res.redirect("/login.html");
        }
        else{
          res.end("Authentication Failed");
        }
        
    }
}
