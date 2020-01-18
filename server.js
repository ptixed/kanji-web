let fs = require("fs");
let request = require('request-promise');

var data = fs.readFileSync('db.json');

for (var id in data.kanjis) {
    data.kanjis[id].radicals = data.kanjis[id].radicals.map(x => data.radicals[x]);
    data.kanjis[id].words    = data.kanjis[id].words   .map(x => data.words   [x]);
}
for (var id in data.words) {
    data.words[id].kanjis    = data.words[id].kanjis   .map(x => data.kanjis  [x]);
}

var port = 8080;
let app = require('express')();

app.get('/', function (req, res) {
    res.send('ok');
});

var server = app.listen(port);
console.error('Server started on port ' + port);
