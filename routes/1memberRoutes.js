var users = require("../models/users.js")
/* 
 * This simple controller is to demonstrate the use of Passport.
 * There are two primary routes: 
 * 1) "/" - Does not require the user to authenticate (log in).
 * 2) "/membersOnly".  This does require autentication
 * And there are two supporting routes to log in and out (with obvious names).
 */

/* 
 * Initialize this controller
 * @param {Express} app - The Express app
 */
exports.init = function(app) {
  // app.js put the Passport object on the Express object so we could get it 
  // handily here.  Note that this form of app.get is NOT a route, rather it is
  // a getter to go along with a prior setter.
  var passport = app.get('passport');
  // Welcome page route
  //app.all('/', index);
  /*
   * A route to display information only for members who are logged in
   * The first argument is the route pattern
   * The second argument is a middleware function to check if the user making
   *    the request has been authenticated.  If so, it will call the next
   *    middleware argument.  If not authenticated, it will res.render an eror.
   * The third argument is the middleware function to handle the membersOnly
   *    route.
   */
  app.get('/membersOnly',
          checkAuthentication,
          doMembersOnly);
  /*
   * A login route.
   * This route only uses the Passport middleware to authenticate the user.
   * It uses the 'local' authentication strategy (defined in 
   *    models/authentication.js).  Upon successful authentication, redirect
   *    the user to the /membersOnly route.  Upon failure to authenticate,
   *    redirect the user to the /login.html page.
   */
  app.post('/login',
          passport.authenticate('local', {
                                  failureRedirect: '/login.html',
                                  successRedirect: '/'}));
  // The Logout route
  app.get('/logout', doLogout);

  app.put('/newUser/:username/:password/:displayName', doNewUser);
}

// No path:  display the welcome page
index = function(req, res) {
  res.render('index');
};

// Members Only path handler
doMembersOnly = function(req, res) {
  // We only should get here if the user has logged in (authenticated) and
  // in this case req.user should be define, but be careful anyway.
  if (req.user && req.user.displayName) {
    // Render the membership information view
    res.render('membersInfo', {member: req.user.displayName});
  } else {
    // Render an error if, for some reason, req.user.displayName was undefined 
    res.render('error', { 'message': 'Application error...' });
  }
};

/*
 * Check if the user has authenticated
 * @param req, res - as always...
 * @param {function} next - The next middleware to call.  This is a standard
 *    pattern for middleware; it should call the next() middleware component
 *    once it has completed its work.  Typically, the middleware you have
 *    been defining has made a response and has not needed any additional 
 *    middleware.
 */
function checkAuthentication(req, res, next){
    // Passport will set req.isAuthenticated
    if(req.isAuthenticated()){
        // call the next bit of middleware
        //    (as defined above this means doMembersOnly)
        next();
    }else{
        // The user is not logged in. Redirect to the login page.
        res.redirect("/login.html");
    }
}

/* 
 * Log out the user
 */
function doLogout(req, res){
  // Passport puts a logout method on req to use.
  req.logout();
  // Redirect the user to the welcome page which does not require
  // being authenticated.
  res.redirect('/');
};

doNewUser = function(req, res){
  console.log("Starting newUser in dbRoutes");

  users.newUser ( req.params.username,
             req.params.password,
             req.params.displayName,
                      function(result) {
                        // result equal to true means create was successful
                        var success = (result ? "Create successful" : "Create unsuccessful");
                        res.end(success);
                        console.log("2. Done with callback in dbRoutes users create");
                      });
  console.log("3. Done with doNewUser in dbRoutes");
}