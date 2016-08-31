/**
 * This app runs the ChainChat messaging client, an IBM Blockchain-powered,
 * decentralized instant-messenger.
 * 
 * Contributors:
 *  - Alexandre Pauwels
 *  - Jack Sartore
 *  - Siddarth Ramesh
 * 
 * Last updated: 08/16/2016
 */

// Express and dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketioJwt = require('socketio-jwt');
var request = require('request');
var color1 = '';

// Routing files
var routes = require('./routes/index');
var users = require('./routes/users');
var main = require('./routes/main');
var profiles = require('./utils/profiles');

// Get the app running with socket.io
var app = express();
var io = require('socket.io')();
var jwtSecret = "trainisland";

// var blop = new Audio('/public/audio/blop.mp3');

people = {};
var pplByName = {};
roomlist = {};
roomlist["Room1"] = {};
roomlist["Room1"].users = {};
roomlist["Room2"] = {};
roomlist["Room2"].users = {};
roomlist["Room3"] = {};
roomlist["Room3"].users = {};


//For anti-spam
var lastmsg = '';
var lastuser;
var lastUserCount = 0;
var maxSpam = 20; //Changes how many messages can be sent before its considered spam

app.io = io;
app.set('io', io);
app.set('jwtSecret', jwtSecret);


// Process blockchain credentials based environment (Bluemix vs. local)
var creds = require('./creds').credentials;

// Setup and configure the hyperledger SDK
var hlc = require('hfc');

chain = hlc.newChain("chainchat");
// chain.setDeployWaitTime(120);
chain.setECDSAModeForGRPC(true);
// app.set('chain',chain);
var cloudkeystore = require('./utils/keystore')
chain.setKeyValStore(cloudkeystore.newCouchDBKeyValStore({
  //   host: 'fdc45491-fa13-4064-a77d-d433ae04a9ec-bluemix.cloudant.com',
  //   port: '443',
  //   username: 'ptioneedengethemanctiont',
  //   password: '26be7f9f1118421e3476858d726630e715843880',
  host: creds.dbcreds.host,
  port: creds.dbcreds.port,
  username: creds.dbcreds.username,
  password: creds.dbcreds.password,
  database: 'keyvalstore',
}));

//Read in Certificate files
var fs = require('fs');
var pem = fs.readFileSync('./certificate.pem');


// Retrieve the CA credentials and set member services in the SDK - should only be one
var caCreds = null;
for (var key in creds.ca) {
  if (creds.ca.hasOwnProperty(key)) {
    caCreds = creds.ca[key];
  }
}
if (caCreds == null) {
  console.log("[ERROR] Unable to retrieve credentials for the member services");
} else {
  //add Membership services
  console.log(creds.caURL);
  chain.setMemberServicesUrl(creds.caURL, { pem: pem });
}

//Add peers
// chain.addPeer("grpcs://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp0.us.blockchain.ibm.com:30303", { pem: pem });
// chain.addPeer("grpcs://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp1.us.blockchain.ibm.com:30303", { pem: pem });
// chain.addPeer("grpcs://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp2.us.blockchain.ibm.com:30303", { pem: pem });
// chain.addPeer("grpcs://ce3f9204-f032-4f01-ae08-b48fda71a2f7_vp3.us.blockchain.ibm.com:30303", { pem: pem });
chain.addPeer(creds.peerURLs[0], { pem: pem });
chain.addPeer(creds.peerURLs[1], { pem: pem });
chain.addPeer(creds.peerURLs[2], { pem: pem });
chain.addPeer(creds.peerURLs[3], { pem: pem });


// Set the chaincode's registrar
chain.enroll("admin", creds.adminPass, function (err, registrarUser) {
  if (err) {
    console.log(err);
    return console.log("[ERROR] Unable to enroll the registrar user: %s", err);
  }
  chain.setRegistrar(registrarUser);
  console.log("[SUCCESS] Enrolled the registrar user: %s", registrarUser);

  // Deploy the chaincode
  var deployReq = {
    args: [],
    fcn: "init",
    chaincodePath: "",
    certificatePath: "/certs/blockchain-cert.pem"
  };

  var deployTx = registrarUser.deploy(deployReq);

  // Store chaincode ID on successful deploy
  deployTx.on('complete', function (results) {
    console.log("[SUCCESS] Deployed chaincode (ID: %s): %j", results.chaincodeID, results);
    chain.chaincodeID = results.chaincodeID;
    profiles.config(chain, results.chaincodeID, "./tmp/user_profiles", {
      // host: 'fdc45491-fa13-4064-a77d-d433ae04a9ec-bluemix.cloudant.com',
      // port: '443',

      // username: 'fdc45491-fa13-4064-a77d-d433ae04a9ec-bluemix',
      // password: '091cc74a21bb7e13ec803fe697722d46337925f7453549c67c1b9bd8fdb03329',
      host: creds.dbcreds.host,
      port: creds.dbcreds.port,
      username: creds.dbcreds.username,
      password: creds.dbcreds.password,
      database: 'user_profiles',

    }, true);
  });

  // Report deployment error
  deployTx.on('error', function (err) {
    console.log("[ERROR] Failed to deploy chaincode: %j", err);
  });
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set favicon, logger, parsers, and the static assets directory
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/', routes);
app.use('/main', main);
app.use('/users', users);

var routes = require('./routes/index');

// When a user connects through sockets add him to the array and set up bindings
io.sockets
  .on('connection', socketioJwt.authorize({
    secret: jwtSecret,
    timeout: 15000
  })).on('authenticated', function (socket) {
    console.log('connection: ', socket.request.connection._peername);
    var usr = socket.decoded_token;
    lastUserCount = 0;
    console.log(usr, 'has been authorized');
    people[socket.id] = usr;
    people[socket.id].id = socket.id;
    pplByName[usr.username] = socket.id;
    people[socket.id].room = 'Room1';
    var personString = JSON.stringify(people[socket.id]);
    people[socket.id].time = new Date().getTime() / 1000; //Time of connection
    people[socket.id].spam = 0.5; //Starting amount of time in between messages
    socket.emit('usermsg', 'Server: Welcome ' + people[socket.id].username + '. You are in the Room1.');
    socket.to(people[socket.id].room).broadcast.emit('usermsg', 'Server: ' + people[socket.id].username + ' has connected to the channel.');
    socket.join(people[socket.id].room);

    roomlist[people[socket.id].room].users[people[socket.id].username] = people[socket.id];
    console.log('list');
    console.log(roomlist);
    var stringppl = JSON.stringify(roomlist[people[socket.id].room].users);
    socket.emit('updateRoom', JSON.stringify(people[socket.id]));
    io.emit('channelListUpdate', JSON.stringify(roomlist), null);

    //Updates everyones user list side bar
    io.to(people[socket.id].room).emit('userlist', stringppl);

    //When a user disconnects delete them from the list and let everyone know
    socket.on('disconnect', function () {
      var nm = people[socket.id].username + '';
      var room = people[socket.id].room;
      console.log(people[socket.id].username + ' disconnected from the socket.io server');
      if (nm != 'undefined') {
        socket.to(people[socket.id].room).broadcast.emit('usermsg', 'Server: ' + people[socket.id].username + ' disconnected');
      }
      delete roomlist[people[socket.id].room].users[people[socket.id].username];
      delete people[socket.id];
      delete pplByName[nm];
      var stringppl = JSON.stringify(roomlist[room].users);
      io.to(room).emit('userlist', stringppl);
      console.log('list');
      console.log(roomlist);
    });

    socket.on('requestRoomChange', function (newRoom) {
      console.log('Room change rquest by: ', people[socket.id].username);
      changeRoom(newRoom, socket);
      console.log('list');
      console.log(roomlist);

    });
    // When a message is received, emit it to everyone
    //DM = Direct Message
    socket.on('message', function (msg) {
      people[socket.id].msg = ' ' + msg;
      if (msg.length > 500) {
        people[socket.id].msg = '';
      }

      //Anti Spam based on time between messages, except 8bot :). 8Bot no more :(
      if (!userSpamming(lastmsg, lastuser, socket, lastUserCount)) {
        if (lastuser == people[socket.id].username) {
          lastUserCount++;
          console.log(lastUserCount);
        } else {
          lastUserCount = 0;
        }

        var msg = people[socket.id].msg.trim();
        var name = '';
        var gifbot = false;
        //Is message a giphy bot call?
        if (msg.indexOf('/giphy') == 0) {
          gifbot = true;
        }
        var secure = people[socket.id];
        secure.gif = gifbot;
        secure.password = '******';
        //Check if user is online for DM
        if (msg.indexOf('@') == 0) {

          // msgToBlockchain(people[socket.id].username, recipient, msg);
          sendDirectMessage(secure, msg, socket);
          //New room joining

        } else if (msg.indexOf('/room') == 0 && msg.trim().length > 5) {
          newRoom = msg.substring(6);
          changeRoom(newRoom, socket);

        } else {
          //No DM
          sendPublicMessage(gifbot, usr, secure, msg, socket);
        }
        io.emit('blop', { audio: '/public/audio/blop.mp3' });
      }
    });
  });

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler will print stack trace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler does not leak stacktraces to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Moves a user from one room to another
 * newRoom = the name of the new room 
 * socket = the socket variable specific to the user
 */
function changeRoom(newRoom, socket) {

  var oldRoom = people[socket.id].room;
  if (newRoom != oldRoom) { //Make sure the user is not trying to join the room they're already in'
    socket.leave(people[socket.id].room);
    delete roomlist[people[socket.id].room].users[people[socket.id].username];
    var oldRoomList = JSON.stringify(roomlist[people[socket.id].room].users);
    io.to(people[socket.id].room).emit('userlist', oldRoomList);

    var toRoom = 'Server: user: ' + people[socket.id].username + ' left the room';
    io.to(people[socket.id].room).emit('usermsg', toRoom);
    people[socket.id].room = newRoom;
    socket.join(people[socket.id].room);
    roomChangeChain(people[socket.id].username, newRoom, socket);

    if (roomlist[people[socket.id].room] == null) { //Check if the newRoom is empty/exists
      roomlist[people[socket.id].room] = {};
      roomlist[people[socket.id].room].users = {};

    }
    console.log(roomlist);
    roomlist[people[socket.id].room].users[people[socket.id].username] = people[socket.id];

    var newRoomList = JSON.stringify(roomlist[people[socket.id].room].users);
    io.to(people[socket.id].room).emit('userlist', newRoomList);

    toRoom = 'Server: ' + people[socket.id].username + ' joined the room';
    socket.to(people[socket.id].room).broadcast.emit('usermsg', toRoom);
    var joinMsg = 'Server: Joined new room: ' + people[socket.id].room;
    socket.emit('usermsg', joinMsg);
    socket.emit('updateRoom', JSON.stringify(people[socket.id]));

    var remove = null;
    if (oldRoom != 'Room1' && oldRoom != 'Room2' && oldRoom != 'Room3') { //Can't delete default rooms
      if (io.nsps['/'].adapter.rooms[oldRoom] == null) {
        delete roomlist[oldRoom];
        remove = oldRoom
        removeRoomChain(oldRoom);
      }
    }
    io.emit('channelListUpdate', JSON.stringify(roomlist), remove);
    console.log(roomlist[people[socket.id].room]);
  }

}

/**Sends a public message 
 * gifbot = boolean, if true, the message will be a gif
 * usr = the json object of the user
 * secure = the json of the user, but with the password field removed 
 *    (Secure object gets sent to the client)
 * msg = the message being sent
 * socket = the socket object for the client (used by socketio)
 */
function sendPublicMessage(gifbot, usr, secure, msg, socket) {
  room = people[socket.id].room;
  secure.dm = false; //Not a direct message
  if (gifbot) { //If its a gif
    var topic = people[socket.id].msg.trim().substring(usr.msg.indexOf('/giphy') + 5);
    secure.msg = topic;
    console.log('New gif message from ' + people[socket.id].username + ': ' + msg + ' Time: ' + people[socket.id].time);
    secure.topic = topic;

    //Gets a related gif's url
    request({
      method: 'GET',
      url: 'http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=' + topic
    }, function (error, response, body) {
      var data = JSON.parse(body).data.image_url;
      console.log('data', data);
      secure.image_url = data;
      io.to(people[socket.id].room).emit('message', JSON.stringify(secure)); //Send out message
    });

  } else {
    //Just plain text message
    console.log('New message from ' + people[socket.id].username + ': ' + msg + ' Time: ' + people[socket.id].time);
    msgToBlockchain(secure.username, room, msg, socket, secure, 'true');
    // io.to(people[socket.id].room).emit('message', JSON.stringify(secure));

    people[socket.id].time = new Date().getTime() / 1000;
    lastmsg = people[socket.id].msg;
    lastuser = people[socket.id].username;
  }
}

/**Sends a direct message to a single person
 * secure = the user object with password removed
 * msg = the message being sent
 * socket = the client socket (socketio)
 */
function sendDirectMessage(secure, msg, socket) {
  console.log("DM: ", msg);
  var recipient = msg.substr(1, msg.indexOf(' ')).trim(); //The name of receiver
  secure.dm = true;
  console.log("Receiver name: ", recipient);
  var userExists = false;
  if (pplByName[recipient] != null) {
    userExists = true;
    msg = msg.substr(msg.indexOf(' ') + 1);
  }


  if (people[socket.id].username == recipient) {
    socket.emit('usermsg', "You cannot send direct messages to yourself.");
  } else if (userExists) {
    console.log('New message from ' + secure.name + ' to ' + recipient);
    secure.msg = ' ' + msg;
    console.log('Message', msg);
    io.to(pplByName[recipient]).emit('message', JSON.stringify(secure));
    secure.msg = ' To ' + recipient + ': ' + msg;
    secure.id = socket.id;
    msgToBlockchain(secure.username, recipient, msg, socket, secure, 'false');
    // socket.emit('message', JSON.stringify(secure));
  } else {
    var userOffline = 'Server: ' + recipient + ' is not currently online.';
    socket.emit('usermsg', userOffline);
    console.log('User not in chat');
  }
}

/** Invokes to add a user to the blockchain when registering
 * ID = the user's ID
 * name = the user's name
 * pubKey = the users public Key (usrename also works)
 * room = the room the user is currently in (should be Room1 by default)
 * online status = whether or not the user is online 
 */
function addUserToChain(ID, name, pubKey, room, onlineStatus) {
  var invokeReq = {
    chaincodeID: chain.chaincodeID,
    fcn: 'addUser',
    args: [ID, name, pubKey, room, onlineStatus]
  }
  var invokeTx = chain.getRegistrar().invoke(invokeReq);
  invokeTx.on('submitted', function (results) {
    console.log('[SUCCESS] User registered');
  });
  invokeTx.on('error', function (err) {
    console.log('[ERROR] Problem adding user: ' + err.toString());
  });
}

/**Invokes a room deletion on the block chain
 * Rooms are deleted when there are no users left in them
 * roomID = the name of the room being deleted
 */
function removeRoomChain(roomID) {
  var invokeReq = {
    chaincodeID: chain.chaincodeID,
    fcn: 'deleteRoom',
    args: [roomID]
  }
  var invokeTx = chain.getRegistrar().invoke(invokeReq);
  invokeTx.on('submitted', function (results) {
    console.log('[SUCCESS] Room deleted');
  });
  invokeTx.on('errro', function (err) {
    console.log('[ERROR] Failed to delete Room. Error: ' + err.toString());
  });
}

/**Invokes a room join on the blockchian when a user joins the room
 * userPubKey = the users public key (just the username while unencrypted)
 * newRoom = the name of the new room 
 * socket = the clients socket object (socketio)
 */
function roomJoinChain(userPubKey, newRoom, socket) {
  var invokeReq = {
    chaincodeID: chain.chaincodeID,
    fcn: 'addUserToRoom',
    args: [userPubKey, newRoom]
  }
  var invokeTx = chain.getRegistrar().invoke(invokeReq);

  invokeTx.on('submitted', function (results) {
    console.log('[SUCCESS] User joined a new room');
  });
  invokeTx.on('error', function (err) {
    console.log('[ERROR] Error joining room' + err.toString());
  });
}

/**Invokes a room change on the blockchain
 * userPubKey = the public key for the user (name while unencrypted)
 * newRoom = the new room name
 * socket = the client's socketio object
 */
function roomChangeChain(userPubKey, newRoom, socket) {
  console.log('App.js roomChange %s', newRoom);
  var invokeReq = {
    chaincodeID: chain.chaincodeID,
    fcn: 'removeUserFromRoom',
    args: [userPubKey]
  }
  var invokeTx = chain.getRegistrar().invoke(invokeReq);
  invokeTx.on('submitted', function (results) {
    console.log('[SUCCESS] User Removed from room');

    //If user successfully leaves a room, they will then join the new one
    roomJoinChain(userPubKey, newRoom, socket);
  });

  invokeTx.on('error', function (err) {
    console.log('[ERROR] Error leaving room: ' + err.toString());
  });
}

/** Invokes a message to the block chain
 * sendrPubKey = the senders key (username while not encrypted)
 * recvrPubKey = the person or Room receiving the message
 * msg = the message being sent
 * socket = the socketio object for the client
 * secure = the user object with password removed
 * isRoom = true (string) if the receivers key is a room name (for public messages),
 *  anything other than "true" and it will be private message 
 * 
 */
function msgToBlockchain(sendrPubKey, recvrPubKey, msg, socket, secure, isRoom) {
  console.log("App.js msg: %s", msg);
  var invokeReq = {
    chaincodeID: chain.chaincodeID,
    fcn: "writeMsg",
    args: [recvrPubKey, sendrPubKey, isRoom, msg, (Math.floor(new Date())).toString()],
  };
  console.log(msg);
  console.log(sendrPubKey);
  console.log(recvrPubKey);
  var invokeTx = chain.getRegistrar().invoke(invokeReq);

  invokeTx.on('submitted', function (results) {
    console.log("[SUCCESS] Sent a message to the blockchain");
    secure.onChain = 1;
    if (isRoom == 'true') {
      //Blockchain listener ports are currently blocked, using socket as placeholder, 
      //but only if the message is on the chain sucessfully
      io.to(people[socket.id].room).emit('message', JSON.stringify(secure));
    } else {
      socket.emit('message', JSON.stringify(secure));
    }
    secure.onChain = 0;

  });
  invokeTx.on('error', function (err) {
    console.log("[ERROR] Error sending message: " + err.toString());
    secure.onChain = 2;
    //socketio message placeholder for the listener
    socket.emit('message', JSON.stringify(secure));
    secure.onChain = 0;
  });
}

/** Used to prevent a user from spamming messages (thanks justin..)
 *  lastmsg = the last message sent
 *  lastuser = the last user to send a message
 *  socket = the clients socket object
 *  lastUserCount = the number of messages sent consecutively by the last 
 *    user to send a message.
 */
function userSpamming(lastmsg, lastuser, socket, lastUserCount) {
  //Anti Spam based on time between messages, except 8bot :). 8Bot no more :(
  if ((new Date().getTime() / 1000) - people[socket.id].time > people[socket.id].spam) {
    /*if(lastmsg == people[socket.id].msg && lastuser == people[socket.id].username) {
      socket.emit('usermsg', 'Server: Please wait before sending any more messages.');
    } else*/

    if (lastuser == people[socket.id].username && lastUserCount >= maxSpam) {
      socket.emit('usermsg', 'Server: You\'ve sent too many messages, please wait before sending any more messages.');
      return true;
    }
  } else {
    if (people[socket.id].spam < maxSpam) {
      people[socket.id].spam = people[socket.id].spam + 0.5;
      socket.emit('usermsg', 'Server: ' + people[socket.id].username + ' you are spamming messages. '
        + ' Please wait ' + people[socket.id].spam + ' seconds in between messages now.');
    } else {
      socket.emit('usermsg', 'Server: Please stop trying to spam.');
    }
    return true;
  }
}
module.exports = app;
module.exports.addUserToChain = addUserToChain;