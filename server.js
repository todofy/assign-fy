var express = require('express');
var url = require('url');

var config = require('./config');
var assignFy = require('./assign-fy');

var app = express();

var sprintf = require('sprintf').sprintf;

app.get('/', function (req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	var repo = query.repo;
	var branch = query.branch;
	var filePath = query.file;

	// TODO: if line no is not mentioned, get the default
	// assignee for the file itself.
	var lineNo = query.line || 0;

	if (repo == undefined
		|| branch == undefined
		|| filePath == undefined) {
		res.statusCode = 400;
		res.json({status: 400, error: 'All fields were not sent in the request!', assignee: null});
		return;
	}

	// TODO: Validate the inputs

	// Get the assignees and score.
	var assignees = assignFy.findAssignees(repo, branch, filePath, lineNo);

	res.setHeader('Content-Type', 'application/json');
    // res.send(JSON.stringify({ status: 200, error: false, assignee: 'mebjas' }, null, 3));
    res.json({ status: 200, error: false, assignee: assignees});
});

app.listen(config.server.port, function () {
  console.log("Node server started on port: %d", config.server.port);
  // TODO(mebjas): server should clear cache directory everytime it stats
});