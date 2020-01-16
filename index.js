let _ = require('lodash');
let request = require('request-promise');

var port = 8080;
let app = require('express')();

app.get('/', function (req, res) {
    res.send('ok');
});

var server = app.listen(port);
console.error('Server started on port ' + port);