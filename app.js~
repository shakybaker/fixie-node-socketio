/*
TODO:

1. If node server not running or error occurs when moving a card then show feedback

*/
	
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , everyauth = require('everyauth')
  , conf = require('./conf')
  , socketio = require('socket.io');

everyauth.debug = true;

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

var usersByVimeoId = {}
  , usersByJustintvId = {}
  , usersBy37signalsId = {}
  , usersByTumblrName = {}
  , usersByDropboxId = {}
  , usersByFbId = {}
  , usersByTwitId = {}
  , usersByGhId = {}
  , usersByInstagramId = {}
  , usersByFoursquareId = {}
  , usersByGowallaId = {}
  , usersByLinkedinId = {}
  , usersByGoogleId = {}
  , usersByAngelListId = {}
  , usersByYahooId = {}
  , usersByGoogleHybridId = {}
  , usersByReadabilityId = {}
  , usersByBoxId = {}
  , usersByOpenId = {}
  , usersByDwollaId = {}
  , usersByLogin = {
  'brian@example.com': addUser({ login: 'brian@example.com', password: 'password'}),
  'mark@example.com': addUser({ login: 'mark@example.com', password: 'password'})
};

everyauth.everymodule
  .findUserById( function (id, callback) {
    callback(null, usersById[id]);
  });

everyauth
  .openid
    .myHostname('http://local.host:3000')
    .findOrCreateUser( function (session, userMetadata) {
      return usersByOpenId[userMetadata.claimedIdentifier] ||
        (usersByOpenId[userMetadata.claimedIdentifier] = addUser('openid', userMetadata));
    })
    .redirectPath('/');


everyauth
  .facebook
    .appId(conf.fb.appId)
    .appSecret(conf.fb.appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      return usersByFbId[fbUserMetadata.id] ||
        (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
    })
    .redirectPath('/');

everyauth
  .twitter
    .consumerKey(conf.twit.consumerKey)
    .consumerSecret(conf.twit.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
      return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
    .redirectPath('/');

everyauth
  .password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('login.jade')
//    .loginLocals({
//      title: 'Login'
//    })
//    .loginLocals(function (req, res) {
//      return {
//        title: 'Login'
//      }
//    })
    .loginLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async login'
        });
      }, 200);
    })
    .authenticate( function (login, password) {
      var errors = [];
      if (!login) errors.push('Missing login');
      if (!password) errors.push('Missing password');
      if (errors.length) return errors;
      var user = usersByLogin[login];
      if (!user) return ['Login failed'];
      if (user.password !== password) return ['Login failed'];

//TODO: sort this out
      user.name = user.login;
      return user;
    })

    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('register.jade')
//    .registerLocals({
//      title: 'Register'
//    })
//    .registerLocals(function (req, res) {
//      return {
//        title: 'Sync Register'
//      }
//    })
    .registerLocals( function (req, res, done) {
      setTimeout( function () {
        done(null, {
          title: 'Async Register'
        });
      }, 200);
    })
    .validateRegistration( function (newUserAttrs, errors) {
      var login = newUserAttrs.login;
      if (usersByLogin[login]) errors.push('Login already taken');
      return errors;
    })
    .registerUser( function (newUserAttrs) {
      var login = newUserAttrs[this.loginKey()];
      return usersByLogin[login] = addUser(newUserAttrs);
    })

    .loginSuccessRedirect('/')
    .registerSuccessRedirect('/');

everyauth.github
  .appId(conf.github.appId)
  .appSecret(conf.github.appSecret)
  .findOrCreateUser( function (sess, accessToken, accessTokenExtra, ghUser) {
      return usersByGhId[ghUser.id] || (usersByGhId[ghUser.id] = addUser('github', ghUser));
  })
  .redirectPath('/');

everyauth.linkedin
  .consumerKey(conf.linkedin.apiKey)
  .consumerSecret(conf.linkedin.apiSecret)
  .findOrCreateUser( function (sess, accessToken, accessSecret, linkedinUser) {
    return usersByLinkedinId[linkedinUser.id] || (usersByLinkedinId[linkedinUser.id] = addUser('linkedin', linkedinUser));
  })
  .redirectPath('/');

everyauth.google
  .appId(conf.google.clientId)
  .appSecret(conf.google.clientSecret)
  .scope('https://www.google.com/m8/feeds/')
  .findOrCreateUser( function (sess, accessToken, extra, googleUser) {
    googleUser.refreshToken = extra.refresh_token;
    googleUser.expiresIn = extra.expires_in;
    return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
  })
  .redirectPath('/');












var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'htuayreve'}));
  app.use(express.methodOverride());
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use("/public/images", express.static(__dirname + '/public/images'));
  app.use("/public/javascripts", express.static(__dirname + '/public/javascripts'));
  app.use("/public/stylesheets", express.static(__dirname + '/public/stylesheets'));
  app.use("/lib", express.static(__dirname + '/lib'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

//app.get('/', routes.login);
app.get('/', routes.home);
app.get('/board', routes.board);

everyauth.helpExpress(app);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

/**
 * Socket.IO server (single process only)
 */

var io = socketio.listen(app);

//io.sockets.on('connection', function (socket) {
//  socket.broadcast.emit('card selected', 'shakythebaker2', 'hello from the server');
//  socket.on('card selected', function (msg) {
//    socket.broadcast.emit('card selected', 'shakythebaker', msg);
//  });
//});

io.sockets.on("connection", function(client){
	var user;
	console.log('Connected!');

	client.send("hello! Welcome to Socket server!");

//	client.on("message", function(msg){
//		console.log("Arrived Message from Client!",msg);
//		client.send("I got  : "+msg);
//	});

	client.on("message", function(msg){
		client.broadcast.emit("messageBroadcast",msg);
	});

	client.on("movingCard", function(data){
		console.log("movingCard: ",data.cardId);
		client.broadcast.emit("movingCardBroadcast",data);
	});

	client.on("movedCard", function(data){
		console.log("movedCard: ",data.cardId);
		client.broadcast.emit("movedCardBroadcast",data);
	});

	client.on("setId", function(id){
		user = id;
	});

	var sendingMsg = setInterval(function(){
//		client.send("Your ID : "+ user);
//		client.broadcast.emit("broadcast","broadcast.emit: This message is for everybody!");
	},5000);
	client.on("disconnect", function() {
		console.log("Client Disconnected!");
	});
});

