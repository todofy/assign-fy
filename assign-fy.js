/**
 * Main source code to identify the potential assignees for a todo
 * based on line of code & the blame around the line of code
 * @returns: at max 'n' number of usernames who could be potential
 * assignees along with scores.
 */

'use strict';

// var githubAuthCookies = require('./githubAuthCookies');
var fs = require('fs');
var sprintf = require('sprintf').sprintf;
var config = require('./config');

// TODO: find an alternative to this module, as it is not
// scalable as per author of the module
var request = require('sync-request');

// Create a cache folder if not exists
if (!fs.existsSync(config.server.cachePath)){
    fs.mkdirSync(config.server.cachePath);
}

// function to syncronously download (or load from cache)
// the html for blame file, for a given repo
function downloadBlame(repo, branch, file, cachePath) {
	// Create a custom cache file path
	var cacheFilePath = sprintf(
		"%s/%s",
		cachePath,
		sprintf("%s_%s_%s", repo, branch, file).replace(/\//g, '.')
	);

	// check if the file exist in cache, for debugging purpose
	if (fs.existsSync(cacheFilePath)) {
		console.log('loading file from cache...');
		return (fs.readFileSync(cacheFilePath));
	}

	var url = sprintf("https://github.com/%s/blame/%s/%s", repo, branch, file);
	// download the HTML data
	var res = request('GET', url, {
		'headers': {
			'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) '
				+ 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36',
			'Connection' : 'keep-alive'
		}
	});

	// cache the HTML output
	console.log('caching the file...');	
	fs.writeFileSync(cacheFilePath, res.body.toString());

	// return the data
	return res.body.toString();
}

function findAssignees(repo, branch, file, line) {
	// Download the blame file
	var blameHTML = downloadBlame(repo, branch, file, config.server.cachePath);

	// Parse the blame file



	return {'mebjas': 1};
}

module.exports = {
	findAssignees: findAssignees
};