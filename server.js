//server.js

// BASE SETUP
// ======================================
// CALL THE PACKAGES --------------------
var express    = require('express'); // call express
var app        = express(); // define our app using express
var bodyParser = require('body-parser'); // get body-parser
var morgan     = require('morgan'); // used to see requests
var mongoose   = require('mongoose'); // for working w/ our database
var User       = require('./user');
var port       = process.env.PORT || 8080; // set the port for our app
var jwt = require('jsonwebtoken');
//secret for creating tokens
var bigSecret = 'beezerthecatthewonderfulwonderfulcat';


// APP CONFIGURATION ---------------------
// use body parser so we can grab information from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// configure our app to handle CORS requests
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \
Authorization');
    next();
});
// log all requests to the console
app.use(morgan('dev'));

//connect the mongoose
mongoose.connect ('mongodb://tigerapp:roaring1141@ds049171.mongolab.com:49171/tigerapp');
//end of connect

// ROUTES FOR OUR API page 157
// =============================

// get an instance of the express Router
// basic route for the home page
app.get('/', function(req, res) {
    res.send('Welcome to the home page!');
});

// get an instance of the express router
var apiRouter = express.Router();

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRouter.post('/authenticate', function(req, res){
    //find the user
    //select the name, username and password explicitly
    User.findOne({
        username: req.body.username
    }).select('name username password').exec(function(err, user) {
        if (err) throw err;
        //no user with that username was found
        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed. User not found'
            });
        } else if (user) {
            //check if password matches
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
                res.json({
                    success:false,
                    message: 'Oopsies. Wrong password'
                });
            } else {
                //if user is found and password is correct, make token
                var token = jwt.sign({
                    name: user.name,
                    username: user.username
                }, bigSecret, { expiresInMinutes: 1440
                    //expires in 24 hours

                });
                //return the info including token as json
                res.json ({
                    success: true,
                    message: 'enjoy your token',
                    token:token
                });
            }
        }
    });
    });
//end of creating a token
//route middleware to verify token
/*

apiRouter.use(function(req, res, next){
    console.log('Somebody just came to our app!');
 // begin verifying token
// check header or url parameters or post parameters for token
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];
// decode token
        if (token) {
// verifies secret and checks exp
            jwt.verify(token, bigSecret, function(err, decoded) {
                if (err) {
                    return res.json({ success: false, message: 'Failed to authenticate token.' });
                } else {
// if everything is good, save to request for use in other routes
                    req.decoded = decoded;
                next();
                }
            });
        } else {
// if there is no token
// return an HTTP response of 403 (access forbidden) and an error message
            return res.status(403).send({
                success: false,
                message: 'No token provided.'
            });
        }
    //go to the next routes
    next();
    });

//end of the route middleware verifying token
*/

//test route to make sure stuff is working
// accessed at GET http://localhost:8080/api
apiRouter.get('/', function(req, res) {
    res.json({ message: 'hooray, and welcome to our api!' });

});

//POST on routes that end in /users
apiRouter.route('/users')
    // create a user (accessed at POST http://localhost:8080/api/users)
    .post(function(req, res) {
// create a new instance of the User model
        var user = new User();
// set the users information (comes from the request)
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
// save the user and check for errors
        user.save(function(err) {
            if (err) {
// duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }
            res.json({ message: 'User created!' });
        });
    })

//end of POST
//begin get all users which lists users in db
// get all the users (accessed at GET http://localhost:8080/api/users)

.get(function(req, res) {
    User.find(function(err, users) {
        if (err) res.send(err);
// return the users
        res.json(users);
    });
});
//end get all users

//get a single user

apiRouter.route('/users/:user_id')
// get the user with that id
// (accessed at GET http://localhost:8080/api/users/:user_id)
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err) res.send(err);
// return that user
            res.json(user);
        });
    })
//end get a single user

//PUT if a user wants to change their name

// update the user with this id
// (accessed at PUT http://localhost:8080/api/users/:user_id)

    .put(function(req, res) {
// use our user model to find the user we want
        User.findById(req.params.user_id, function(err, user) {
            if (err) res.send(err);
// update the users info only if its new
            if (req.body.name) user.name = req.body.name;
            if (req.body.username) user.username = req.body.username;
            if (req.body.password) user.password = req.body.password;
// save the user
            user.save(function(err) {
                if (err) res.send(err);
// return a message
                res.json({ message: 'User updated!' });
            });
        });
    })

//end of PUT

// delete the user with this id

// (accessed at DELETE http://localhost:8080/api/users/:user_id)
.delete(function(req, res) {
    User.remove({
        _id: req.params.user_id
    }, function(err, user) {
        if (err) return res.send(err);
        res.json({ message: 'Successfully deleted' });
    });
});

//end of deleting user

//api end point to get user info
apiRouter.get('/me', function(req,res){
    res.send(req.decoded)
;
});
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', apiRouter);


// START THE SERVER
// ===============================
app.listen(port);
console.log('Magic happens on port ' + port);

