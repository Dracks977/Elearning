/*=====================Initialisation=====================*/
const express = require("express");
require("dotenv").config();
const app = express();
const http = require("http").Server(app);
const fs = require("fs");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const moment = require("moment");
const svnUltimate = require("node-svn-ultimate");
let info = {};
var schedule = require("node-schedule");
const io = require("socket.io")(http);

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

fs.access("./svn", fs.constants.F_OK, err => {
	console.log(`"./svn" ${err ? "does not exist" : "exists"}`);
	if (err) {
		svnUltimate.commands.checkout(
			process.env.SVN,
			"./svn",
			{ username: process.env.SVN_USER, password: process.env.SVN_PASS },
			function(err) {
				if (err) console.log(err);
				info.checkout = true;
				io.emit("info", info);
			}
		);
	}
});

getcrenaux(process.env.SVN_HEURE * 2 - 1, function(crenaux) {
	info.cron = [];
	var m = moment()
		.hours(process.env.SVN_START_H)
		.minutes(getRandomInt(5));
	// m.add(1, "d");
	cron(m, 0);
	for (c in crenaux) {
		m.add({
			minutes: crenaux[c].m,
			seconds: crenaux[c].s,
			milliseconds: getRandomInt(99)
		});
		cron(m, parseInt(parseInt(c) + 1));
	}
	io.emit("info", info);
});

function cron(date, i) {
	var j = schedule.scheduleJob(date.toDate(), function(err) {
		svnUltimate.commands.update(
			"./svn",
			{ username: process.env.SVN_USER, password: process.env.SVN_PASS },
			function(err) {
				if (err) info.cron[i].err = err;
				info.cron[i].exc = true;
				io.emit("info", info);
			}
		);
	});
	console.log(j.nextInvocation());
	info.cron[i] = {
		time: j ? j.nextInvocation()._date.format("DD/MM/YYYY HH:mm:ss") : null,
		exc: false,
		err: null
	};
	io.emit("info", info);
}

function getcrenaux(nbr, callback) {
	let heure = [];
	for (var i = nbr - 1; i >= 0; i--) {
		var random = (Math.random() * (5.1 - 0.5) + 0.5).toFixed(2);
		let t = 30 / 10 + random;
		heure[i] = {};
		heure[i].m = t.split(".")[0];
		heure[i].s = t.split(".")[1];
	}
	callback(heure);
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function toTimestamp(strDate) {
	var datum = Date.parse(strDate);
	return datum / 1000;
}

/*======================route fichier static (public)====================*/
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/img", express.static(__dirname + "/public/img"));
app.use("/js", express.static(__dirname + "/public/js"));

/*==================start serv==================*/
http.listen(process.env.PORT, function() {
	console.log("listening on *:" + process.env.PORT);
});
