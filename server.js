let fs = require("fs");
let request = require('request-promise');
let express = require('express');

var app = express();

app.use(express.static('content'));

app.get('/save', function (req, res) {
    fs.writeFileSync('content/db.json', req.body);
});
app.get('/load', function (req, res) {
    var data = fs.readFileSync('content/db.json');
    res.write(data);
    res.end();
});

var port = 8080;
var server = app.listen(port);
console.error('Server started on port ' + port);
