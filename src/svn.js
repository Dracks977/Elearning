const svnUltimate = require("node-svn-ultimate");
const schedule = require("node-schedule");
module.exports = {
	//recupere tout les info
	cron: (date, i) => {
		var j = schedule.scheduleJob(date.toDate(), function(err) {
			svnUltimate.commands.update(
				"./svn",
				{
					username: process.env.SVN_USER,
					password: process.env.SVN_PASS
				},
				function(err) {
					if (err) info.cron[i].err = err;
					else info.cron[i].exc = true;
					io.emit("info", info);
				}
			);
		});
		info.cron[i] = {
			time: j
				? j.nextInvocation()._date.format("DD/MM/YYYY HH:mm:ss")
				: "too late bro !",
			exc: false,
			err: null
		};
		io.emit("info", info);
	},
	getcrenaux: (nbr, callback) => {
		let heure = [];
		for (var i = nbr - 1; i >= 0; i--) {
			var random = (Math.random() * (5.1 - 0.5) + 0.5).toFixed(2);
			let t = 30 / 10 + random;
			heure[i] = {};
			heure[i].m = t.split(".")[0];
			heure[i].s = t.split(".")[1];
		}
		callback(heure);
	},
	checkout: (repo, callback) => {
		fs.remove("./svn", err => {
			svnUltimate.commands.checkout(
				encodeURI(repo),
				"./svn",
				{
					username: process.env.SVN_USER,
					password: process.env.SVN_PASS
				},
				function(err) {
					if (err) console.log(err);
					else info.checkout = true;
					console.log("finish");
					io.emit("info", info);
					callback();
				}
			);
		});
	}
};
