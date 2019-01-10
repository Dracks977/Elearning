var request = require("request");
var request = request.defaults({ jar: true }); // active les cookie
module.exports = {
	login: callback => {
		request.post(
			{
				url: "https://auth.etna-alternance.net/login",
				form: {
					login: process.env.SVN_USER,
					password: process.env.SVN_PASS
				}
			},
			function(err, httpResponse, body) {
				if (err) console.log(err);
				callback(JSON.parse(body).login);
			}
		);
	},
	// ne marche que avec les projet pour le moment
	getactivity: (name, callback) => {
		info.svn = [];
		request.get(
			"https://modules-api.etna-alternance.net/students/" +
				name +
				"/currentactivities",
			function(err, httpResponse, body) {
				let activities = JSON.parse(body);
				for (var key in activities) {
					if (activities[key].project) {
						for (var i in activities[key].project) {
							info.svn.push(activities[key].project[i].svn);
						}
					}
				}
				callback();
			}
		);
	}
};
