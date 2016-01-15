var GovnoGame = {
    gameId: null,
    init: function() {
        var socket = io.connect(window.location.hostname + ':3000');

        $(".game-table").on("click", function(e){
            socket.emit('click', $(".cell", this).index(e.target));
        });
        socket.on('clicked', function (index) {
            $(".cell").eq(index).text(index);
        });

        //$('form').submit(function () {
        //    socket.emit('click', $('#m').val());
        //    $('#m').val('');
        //    return false;
        //});

        socket.on('chat message', function (msg) {
            $('#messages').append($('<li>').text(msg));
        });

        socket.on('connect', function () {
            console.log("connect");
        });
        socket.on('reconnect', function () {
            console.log("reconect");
        });
        socket.on('reconnecting', function () {
            console.log("reconnecting");
        });
        socket.on('error', function (e) {
            console.log("error" + e);
        });
    }
};
