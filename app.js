/*=====================Initialisation=====================*/
const express = require("express");
require("dotenv").config();
const app = express();
const http = require("http").Server(app);
fs = require("fs-extra");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const moment = require("moment");
info = {};
io = require("socket.io")(http);
SVN = require("./src/svn.js");
UTILS = require("./src/utils.js");
ETNA = require("./src/etna.js");

/*======================================================*/

// Middleware session
app.engine("html", require("ejs").renderFile);

app.use(bodyParser.json()); // to support JSON-encoded bodies

app.use(
	bodyParser.urlencoded({
		// to support URL-encoded bodies
		extended: true
	})
);
//metre le tout sur un site avec des socket
/*======================routes==========================*/

app.get("/", function(req, res) {
	res.sendFile(path.resolve(__dirname + "/index.html"));
});

io.on("connection", socket => {
	socket.emit("info", info); // emit an event to the socket
});

ETNA.login(function(name) {
	ETNA.getactivity(name, function() {
		console.log("Starting On: " + info.svn[0]);
		SVN.checkout(info.svn[0], function() {
			io.emit("info", info);
			SVN.getcrenaux(process.env.SVN_HEURE * 2, function(crenaux) {
				info.cron = [];
				var m = moment()
					.hours(process.env.SVN_START_H)
					.minutes(UTILS.getRandomInt(5));
				// m.add(1, "d");
				SVN.cron(m, 0);
				for (c in crenaux) {
					m.add({
						minutes: crenaux[c].m,
						seconds: crenaux[c].s,
						milliseconds: UTILS.getRandomInt(99)
					});
					SVN.cron(m, parseInt(parseInt(c) + 1));
				}
				io.emit("info", info);
			});
		});
	});
});

/*======================route fichier static (public)====================*/
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/img", express.static(__dirname + "/public/img"));
app.use("/js", express.static(__dirname + "/public/js"));

/*==================start serv==================*/
http.listen(process.env.PORT, function() {
	console.log("listening on *:" + process.env.PORT);
});
