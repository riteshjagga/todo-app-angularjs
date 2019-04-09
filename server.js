var express = require('express');
var path = require('path');
var server = express();

server.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'app/index.html'));
});

server.use(express.static(__dirname));
server.listen(process.env.PORT || 3000);
