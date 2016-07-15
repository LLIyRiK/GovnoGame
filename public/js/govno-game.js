var GovnoGame = {
    gameId: null,
    gameOverlay: null,
    init: function () {
        var self = this;
        //var socket = this.socket = io.connect("https://frozen-mountain-53156.herokuapp.com");
        var socket = this.socket = io.connect(window.location.origin);
        this.gameOverlay = $(".game-start-overlay");

        $("#findGame").on("click", function () {
            socket.emit("start");
            $(".cssload-loader").show();
            $("#findGame").hide();
            self.gameOverlay.find(".text").hide();
        });


        socket.on('clicked', function (stepData) {
            GovnoGame.step(stepData);
        });

        socket.on('ready', function (game) {
            $(".game-table").on("click", function (e) {
                socket.emit('click', GovnoGame.gameId, $(".cell", this).index(e.target));
            });
            GovnoGame.startGame(game);
        });

        socket.on('opponent-disc', function (msg) {
            console.log("opponent-disc");
            GovnoGame.end("Enemy crap");
        });

        socket.on('wait', function (msg) {
            console.log("wait");
        });

        socket.on('connect', function () {
            console.log("connect");
            self.gameOverlay.show();
        });

        socket.on('disconnected', function () {
            console.log("disconnected")
        });

        socket.on('reconnect', function () {
            console.log("reconnect");
        });
        socket.on('reconnecting', function () {
            console.log("reconnecting");
        });
        socket.on('error', function (e) {
            console.log("error" + e);
        });
    },
    startGame: function (game) {
        this.gameId = game.id;
        if (game.user.id === "/#" + this.socket.id) {
            this.user = game.user;
            this.opponent = game.opponent;
        } else {
            this.user = game.opponent;
            this.opponent = game.user;
        }
        this.user.score = 0;
        this.opponent.score = 0;

        var table = $(".game-table").empty();
        var sizeCell = parseInt(table[0].offsetWidth / game.cell) + "px";
        for (var i = 0; i < game.row; i++) {
            var row = $('<div/>').addClass("row").css("height", sizeCell);
            for (var j = 0; j < game.cell; j++) {
                row.append($('<div/>').addClass("cell").css({width: sizeCell, height: sizeCell}));
            }
            table.append(row);
        }

        $(".cssload-loader").hide();

        var timeToStart = 3,
            self = this;

        function countdown() {
            self.gameOverlay.find(".text").text(timeToStart).fadeIn(500).fadeOut(500);
            if (timeToStart <= 0) {
                clearInterval(id);
                self.gameOverlay.hide();
            }
            timeToStart--;
        }

        countdown();
        var id = setInterval(countdown, 1000)

    },
    step: function (stepData) {
        var player = this.getPlayer(stepData.id);
        player.score++;
        $(".cell").eq(stepData.cellIndex).addClass(player.color);
        $(".score span").text("You: " + this.user.score + ", Enemy: " + this.opponent.score);

        if (stepData.isWin) {
            var text = this.user.score > this.opponent.score ? "You Win!!!" :
                (this.user.score == this.opponent.score ? "Draw" : "You lose ;(");
            this.end(text);
        }
    },
    getPlayer: function (id) {
        if (this.user.id === id) {
            return this.user;
        } else {
            return this.opponent;
        }
    },
    end: function(text) {
        this.gameId = null;
        this.user = null;
        this.opponent = null;
        this.gameOverlay.show();
        $("#findGame").show();
        this.gameOverlay.find(".text").show().text(text);
    }
};

$(function () {
    GovnoGame.init();
});