var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var socketsId = [];

//fucntions
var findIndex = function(arg){
  for (var i = 0; i < socketsId.length; i++) {
    if ( socketsId[i].socketId == arg )
      return i;
  };
  return false;
};
function usersTyping(){
  let users = [];
  for (var i = 0; i < socketsId.length; i++) {
    if ( socketsId[i].isTyping )
      users.push(socketsId[i].nick)
  };
  return users;
}
function usersOnline(){
  let users = [];
  for (var i = 0; i < socketsId.length; i++) {
    users.push({ "id" : socketsId[i].socketId, "nick" : socketsId[i].nick })
  };
  return users;
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socketsId.push({
    socketId : socket.id,
    nick : "anónimo",
    isTyping : false
  });

  io.emit('online', usersOnline());

  socket.on('disconnect', function(){
    socketsId.splice( findIndex(socket.id), 1 );
    io.emit('online', usersOnline());
  });

  socket.on('chat message', function(data){
    io.emit('chat message', data);
    socketsId[findIndex(socket.id)].isTyping = false;
    io.emit('typing', usersTyping());
  });

  socket.on('typing', function(data){
    socketsId[findIndex(socket.id)].nick = data.nick;
    if (data.msg == "")
      socketsId[findIndex(socket.id)].isTyping = false;
    else
      socketsId[findIndex(socket.id)].isTyping = true;

    io.emit('typing', usersTyping());
  });

  socket.on('typing-nickname', function(data){
    socketsId[findIndex(socket.id)].nick = data.nick;
    io.emit('online', usersOnline());
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
