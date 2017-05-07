var sqlite3 = require('sqlite3').verbose();
var request = require('request');
var async = require('async');
// console.log("hello");
var db = new sqlite3.Database('local-db.db', 'OPEN_READWRITE | OPEN_CREATE', function(err) {
    if (err) {
        console.log("Error creating DB: " + err);
    }
})

db.run("CREATE TABLE IF NOT EXISTS violation(id INTEGER PRIMARY KEY AUTOINCREMENT, time NUMERIC NOT NULL, file TEXT NOT NULL)");

module.exports = function(app) {

    app.get('/set_data', function(req, res) {
        var filename = req.query.fileName;
        var time = req.query.time;
        var statement = db.prepare("INSERT INTO violation (time, file) VALUES (?, ?)");
        statement.run([time, filename]);
        statement.finalize();
        res.send("Added to DB");
    })
    app.get("/post_license", function(req, res) {
        console.log("License posted: "  + req.query.number);
        db.run("DELETE FROM violation WHERE id=" + req.query.id);
        request.get('http://localhost:3000/api/camera/send_failed_image?time=' + req.query.time + "&number=" + req.query.number);
    })

    app.get("/pending_licenses", function(req, res) {
        var plates = [];
        async.series([
            function(callback) {
                db.each("SELECT * FROM violation", function(err, row, callback) {
                    plates.push(row);
                }, callback)
            },
            function(callback) {
                console.log(plates);
                res.send(plates);
                callback(null, null )
            }
        ])
    })
}
