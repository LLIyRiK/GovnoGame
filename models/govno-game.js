var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    uuid = require("node-uuid");

var GovnoGame = module.exports = function() {
    EventEmitter.call(this);

    this.games = {};

    this.users = [];
    this.free = [];

};

util.inherits(GovnoGame, EventEmitter);

var GameItem = function(userId, opponentId) {

    EventEmitter.call(this);

    this.user = {
        id: userId,
        color: "pink"
    };
    this.opponent = {
        id: opponentId,
        color: "green"
    };
    this.getPlayer = function(id) {
       if(this.user.id === id) {
           return this.user;
       } else {
           return this.opponent;
       }
    };
    this.row = 15;
    this.cell = 10;
    this.gameBoard = new Array(this.row * this.cell);
    this.gameBoard.fill(false);
};

util.inherits(GameItem, EventEmitter);

GovnoGame.prototype.start = function (userId) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(self.free.length > 0){
            var opponentId = self.free.shift().id;
            var game = new GameItem(userId, opponentId);
            var gameId = uuid.v1();
            self.games[gameId] = game;
            game.id = gameId;
            self.users[userId] = gameId;
            self.users[opponentId] = gameId;
            resolve(game);
        } else {
            self.free.push({id: userId});
            resolve({waiting: true})
        }
    })
};

GovnoGame.prototype.end = function (userId){
    var self = this;
    return new Promise(function(resolve, reject){
      if(self.users[userId] === false) return;
        var gameId = self.users[userId];
        var game = self.games[gameId];
        var opponentId = (game.user.id === userId) ? game.opponent.id : game.user.id;
        delete self.users[game.user.id];
        delete self.users[game.opponent.id];
        game = null;
        delete self.games[gameId];
        resolve({gameId: gameId, opponentId: opponentId});
  })
};

GameItem.prototype.step = function(index, id) {
    var self = this;
    return new Promise(function(resolve, reject) {
        if(self.gameBoard[index] === false){
            self.gameBoard[index] = id;
            var win = self.gameBoard.indexOf(false) === -1;
            resolve({cellIndex: index, id: id, isWin: win});
        } else {
            reject();
        }
    })
};