var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var GovnoGame = require('./models/govno-game.js');

var Game = new GovnoGame(),
    countGames = 0;

app.use(express.static(__dirname + '/public'));
server.listen( (process.env.PORT || 3000), function () {
    console.log('listening on *:3000');
});

io.on('connection', function (socket) {

    socket.on("start", function () {
        Game.start(socket.id).then(function (game) {
            if (!game.waiting) {
                socket.join(game.id);
                io.sockets.connected[game.opponent.id].join(game.id);

                io.in(game.id).emit("ready", game);
                countGames++;
            } else {
                socket.emit("wait");
            }
        });
    });

    function closeRoom(gameId, opponentId) {
        socket.leave(gameId);
        io.connected[opponentId].leave(gameId);
        countGames--;
    }

    socket.on('click', function (gameId, index) {
        if (Game.games[gameId] === undefined) return;
        var game = Game.games[gameId];
        game.step(index, socket.id).then(function(data) {
            io.in(gameId).emit('clicked', data);
        });

    });

    socket.on('disconnect', function () {
        console.log('user disconnected');
        Game.end(socket.id.toString()).then(function(data) {
            io.sockets.connected[data.opponentId].emit("opponent-disc");
            closeRoom(data.gameId, data.opponentId);
        })
    });

    socket.broadcast.emit('hi');
});

