socket = io.connect('http://localhost:8002');

socket.on('game.init', function (data) {
    console.log(data);
});