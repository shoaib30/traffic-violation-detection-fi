var express = require('express');
var routes = require('./routes');

var app = express();

app.use(express.static('app'));
routes(app);

app.listen(3004, function() {
    console.log("Listening on port 3004");
});
