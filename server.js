var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static("static"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/static/index.html");
});

var port = process.env.PORT || 3000;
server.listen(port, function () {
    console.log(`Running on port ${port}...`);
});
